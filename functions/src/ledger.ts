// [P0][APP][CODE] Ledger
// Tags: P0, APP, CODE
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Firestore, Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

import { calculateShiftPay, ShiftPayBreakdown } from "./domain/billing";

/**
 * Admin initialization guard.
 */
if (!getApps().length) {
  initializeApp();
}

const db: Firestore = getFirestore();

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

interface AttendanceDoc {
  orgId: string;
  userId: string;
  status: string;
  partnershipId?: string;
  hourlyRate?: number;
  overtimeThresholdMinutes?: number;
  overtimeMultiplier?: number;
  clockIn?: Timestamp;
  clockOut?: Timestamp;
}

interface PartnershipDoc {
  defaultHourlyRate?: number;
  overtimeThresholdMinutes?: number;
  overtimeMultiplier?: number;
}

interface LedgerEntry extends ShiftPayBreakdown {
  orgId: string;
  userId: string;
  attendanceId: string;
  partnershipId?: string;
  createdAt: Timestamp;
  clockIn: Timestamp;
  clockOut: Timestamp;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Compute minutes diff between two Firestore Timestamps.
 */
function diffMinutes(start: Timestamp, end: Timestamp): number {
  const ms = end.toMillis() - start.toMillis();
  if (ms <= 0) return 0;
  return Math.round(ms / 60000);
}

/* -------------------------------------------------------------------------- */
/* Trigger: onAttendanceApproved                                              */
/* -------------------------------------------------------------------------- */

/**
 * Whenever an attendance document transitions into "approved" state, compute
 * the pay breakdown and write a ledger entry under a corporate accounts
 * collection. This is a one-way ledger – we do not mutate historical entries.
 */
export const onAttendanceApproved = onDocumentUpdated(
  "orgs/{orgId}/attendance/{attendanceId}",
  async (event) => {
    const { orgId, attendanceId } = event.params;

    const before = event.data?.before.data() as AttendanceDoc | undefined;
    const after = event.data?.after.data() as AttendanceDoc | undefined;

    if (!before || !after) {
      logger.warn("onAttendanceApproved: missing before/after data", {
        orgId,
        attendanceId,
      });
      return;
    }

    // Only act when status changes from != "approved" to "approved".
    if (before.status === "approved" || after.status !== "approved") {
      return;
    }

    if (!after.clockIn || !after.clockOut) {
      logger.warn("onAttendanceApproved: clockIn/clockOut missing, cannot compute pay", {
        orgId,
        attendanceId,
      });
      return;
    }

    const userId = after.userId;
    if (!userId) {
      logger.warn("onAttendanceApproved: attendance missing userId, skipping ledger", {
        orgId,
        attendanceId,
      });
      return;
    }

    logger.info("onAttendanceApproved: processing ledger entry", {
      orgId,
      attendanceId,
      userId,
    });

    try {
      // Step 1: Determine pay parameters (from attendance or partnership)
      let hourlyRate = after.hourlyRate;
      let overtimeThresholdMinutes = after.overtimeThresholdMinutes;
      let overtimeMultiplier = after.overtimeMultiplier;

      if (!hourlyRate || !overtimeThresholdMinutes || !overtimeMultiplier) {
        // Load partnership as a fallback source of default rates.
        if (after.partnershipId) {
          const partnershipRef = db.doc(`orgs/${orgId}/partnerships/${after.partnershipId}`);
          const partnershipSnap = await partnershipRef.get();
          if (partnershipSnap.exists) {
            const pdata = partnershipSnap.data() as PartnershipDoc;
            hourlyRate = hourlyRate ?? pdata.defaultHourlyRate;
            overtimeThresholdMinutes = overtimeThresholdMinutes ?? pdata.overtimeThresholdMinutes;
            overtimeMultiplier = overtimeMultiplier ?? pdata.overtimeMultiplier;
          } else {
            logger.warn(
              "onAttendanceApproved: partnership not found, falling back to attendance-only rates",
              {
                orgId,
                attendanceId,
                partnershipId: after.partnershipId,
              },
            );
          }
        }
      }

      // If we still do not have an hourlyRate, bail – we cannot compute pay.
      if (!hourlyRate || hourlyRate <= 0) {
        logger.error(
          "onAttendanceApproved: hourlyRate is missing or invalid, cannot create ledger entry",
          {
            orgId,
            attendanceId,
          },
        );
        return;
      }

      const durationMinutes = diffMinutes(after.clockIn, after.clockOut);
      if (durationMinutes <= 0) {
        logger.warn("onAttendanceApproved: non-positive duration, skipping ledger", {
          orgId,
          attendanceId,
          durationMinutes,
        });
        return;
      }

      const breakdown: ShiftPayBreakdown = calculateShiftPay({
        durationMinutes,
        hourlyRate,
        overtimeRules:
          overtimeThresholdMinutes && overtimeMultiplier
            ? {
                overtimeThresholdMinutes,
                overtimeMultiplier,
              }
            : undefined,
      });

      const ledgerEntry: LedgerEntry = {
        orgId,
        userId,
        attendanceId,
        partnershipId: after.partnershipId,
        createdAt: Timestamp.now(),
        clockIn: after.clockIn,
        clockOut: after.clockOut,
        regularPay: breakdown.regularPay,
        overtimePay: breakdown.overtimePay,
        totalPay: breakdown.totalPay,
        overtimeMinutes: breakdown.overtimeMinutes,
      };

      // Write to a corporate accounts ledger – adjust path to your model.
      const ledgerRef = db
        .collection("corporate_accounts")
        .doc(orgId)
        .collection("ledger")
        .doc(attendanceId);

      await ledgerRef.set(ledgerEntry);

      logger.info("onAttendanceApproved: ledger entry written", {
        orgId,
        attendanceId,
        userId,
        totalPay: breakdown.totalPay,
      });
    } catch (error: unknown) {
      logger.error("onAttendanceApproved failed", {
        orgId,
        attendanceId,
        error: (error as Error).message,
      });
      // Let Functions retry according to its retry policy.
      throw error;
    }
  },
);
