// [P1][FIREBASE][HELPERS] Type-safe Firebase wrapper functions
// Tags: P1, FIREBASE, HELPERS, TYPING
/**
 * Type-safe wrapper functions for Firebase Admin SDK Firestore operations.
 *
 * These wrappers provide:
 * - Generic type parameters for type-safe document reads
 * - Consistent error handling
 * - Reduced TypeScript unsafe-member-access warnings
 * - Better IDE autocomplete and type checking
 *
 * Usage:
 *   const doc = await getDocWithType<ScheduleData>(db, scheduleRef);
 *   const docs = await queryWithType<ScheduleData>(db, q);
 */

import type {
  Firestore,
  DocumentReference,
  Query,
  UpdateData,
  WithFieldValue,
  Transaction,
} from "firebase-admin/firestore";

/**
 * Result type for operations that may return null or throw
 */
export type FirebaseResult<T> = T | null;

/**
 * Options for query operations
 */
export interface QueryOptions {
  readonly allowEmpty?: boolean;
}

/**
 * Retrieve a single document with type safety
 *
 * @template T The expected document type
 * @param db Firestore instance
 * @param ref DocumentReference to fetch
 * @returns Document data as type T, or null if not found
 * @throws Error if document retrieval fails
 *
 * @example
 * ```ts
 * const schedule = await getDocWithType<Schedule>(db, scheduleRef);
 * if (schedule) {
 *   console.log(schedule.name); // TypeScript knows schedule.name exists
 * }
 * ```
 */
export async function getDocWithType<T extends Record<string, unknown>>(
  db: Firestore,
  ref: DocumentReference,
): Promise<FirebaseResult<T>> {
  const snap = await ref.get();
  return snap.exists ? (snap.data() as T) : null;
}

/**
 * Retrieve a single required document with type safety
 * Throws if document doesn't exist
 *
 * @template T The expected document type
 * @param db Firestore instance
 * @param ref DocumentReference to fetch
 * @returns Document data as type T
 * @throws Error if document not found or retrieval fails
 *
 * @example
 * ```ts
 * const schedule = await getDocWithTypeOrThrow<Schedule>(db, scheduleRef);
 * console.log(schedule.name); // TypeScript knows schedule.name exists
 * ```
 */
export async function getDocWithTypeOrThrow<T extends Record<string, unknown>>(
  db: Firestore,
  ref: DocumentReference,
): Promise<T> {
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error(`Document at path ${ref.path} does not exist`);
  }
  return snap.data() as T;
}

/**
 * Execute a query and retrieve all matching documents with type safety
 *
 * @template T The expected document type for each result
 * @param db Firestore instance
 * @param q Query to execute
 * @param options Optional configuration
 * @returns Array of documents as type T
 * @throws Error if query execution fails
 *
 * @example
 * ```ts
 * const q = query(
 *   collection(db, "organizations/acme/schedules"),
 *   where("status", "==", "published"),
 *   orderBy("createdAt", "desc")
 * );
 * const schedules = await queryWithType<Schedule>(db, q);
 * ```
 */
export interface QueryResult<T> {
  success: boolean;
  data: T[];
}

export async function queryWithType<T extends Record<string, unknown>>(
  db: Firestore,
  q: Query,
  options?: QueryOptions,
): Promise<QueryResult<T>> {
  const snap = await q.get();

  if (snap.empty && options?.allowEmpty === false) {
    throw new Error("Query returned no results");
  }

  const rows = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id, // Include document ID for convenience
    } as unknown as T;
  });

  return { success: true, data: rows };
}

/**
 * Execute a query and retrieve a single document
 * Throws if no documents match or multiple documents match (when enforced)
 *
 * @template T The expected document type
 * @param db Firestore instance
 * @param q Query to execute
 * @returns Single document as type T, or null if not found
 * @throws Error if multiple documents match
 *
 * @example
 * ```ts
 * const q = query(
 *   collection(db, "organizations/acme/memberships"),
 *   where("userId", "==", userId),
 *   where("orgId", "==", orgId),
 *   limit(1)
 * );
 * const membership = await queryWithTypeSingle<Membership>(db, q);
 * ```
 */
export interface QuerySingleResult<T> {
  success: boolean;
  data: T | null;
}

export async function queryWithTypeSingle<T extends Record<string, unknown>>(
  db: Firestore,
  q: Query,
): Promise<QuerySingleResult<T>> {
  const snap = await q.limit(1).get();

  if (snap.empty) {
    return { success: false, data: null };
  }

  const doc = snap.docs[0];
  return { success: true, data: { ...doc.data(), id: doc.id } as unknown as T };
}

/**
 * Create or overwrite a document with type safety
 * Ensures type matches document schema at compile time
 *
 * @template T The document type being set
 * @param db Firestore instance
 * @param ref DocumentReference where document will be written
 * @param data Document data (must match type T)
 * @param options Optional merge option
 * @throws Error if write operation fails
 *
 * @example
 * ```ts
 * const schedule: Schedule = {
 *   id: "sched-1",
 *   name: "Fall 2024",
 *   startDate: Timestamp.now(),
 *   endDate: Timestamp.fromDate(new Date("2024-12-31")),
 *   status: "draft",
 *   createdAt: Timestamp.now(),
 * };
 * await setDocWithType(db, scheduleRef, schedule);
 * ```
 */
export async function setDocWithType<T extends Record<string, unknown>>(
  db: Firestore,
  ref: DocumentReference,
  data: WithFieldValue<T>,
  options?: { merge?: boolean },
): Promise<void> {
  if (options?.merge) {
    await ref.set(data, { merge: true });
  } else {
    await ref.set(data);
  }
}

/**
 * Update a document with type safety
 * Only allows updating fields that exist in type T
 *
 * @template T The document type being updated
 * @param db Firestore instance
 * @param ref DocumentReference to update
 * @param data Partial document data (subset of T fields)
 * @throws Error if update operation fails
 *
 * @example
 * ```ts
 * await updateDocWithType<Schedule>(db, scheduleRef, {
 *   status: "published",
 *   updatedAt: Timestamp.now(),
 * });
 * ```
 */
export async function updateDocWithType<T extends Record<string, unknown>>(
  db: Firestore,
  ref: DocumentReference,
  data: UpdateData<T>,
): Promise<void> {
  await ref.update(data);
}

/**
 * Delete a document
 *
 * @param db Firestore instance
 * @param ref DocumentReference to delete
 * @throws Error if delete operation fails
 *
 * @example
 * ```ts
 * await deleteDoc(db, scheduleRef);
 * ```
 */
export async function deleteDocSafe(db: Firestore, ref: DocumentReference): Promise<void> {
  await ref.delete();
}

/**
 * Execute a transaction with type-safe document operations
 * Useful for atomic multi-document updates
 *
 * @template T Return type of the transaction function
 * @param db Firestore instance
 * @param updateFn Transaction function (receives transaction object)
 * @returns Result of the transaction function
 * @throws Error if transaction fails or is aborted
 *
 * @example
 * ```ts
 * const result = await transactionWithType<{ success: boolean }>(db, async (txn) => {
 *   const memberDoc = await getDocWithType<Member>(db, memberRef);
 *   if (!memberDoc) throw new Error("Member not found");
 *
 *   await txn.update(memberRef, { status: "active" });
 *   await txn.set(auditRef, { action: "activated", timestamp: Timestamp.now() });
 *
 *   return { success: true };
 * });
 * ```
 */
export async function transactionWithType<T>(
  db: Firestore,
  updateFn: (txn: Transaction) => Promise<T>,
): Promise<T> {
  return db.runTransaction(updateFn);
}

/**
 * Batch write multiple documents with type safety
 * Automatically commits the batch
 *
 * @param db Firestore instance
 * @param operations Array of write operations
 * @throws Error if batch write fails
 *
 * @example
 * ```ts
 * const batch = db.batch();
 * const operations = [
 *   { type: "set", ref: scheduleRef, data: schedule },
 *   { type: "update", ref: orgRef, data: { scheduleCount: FieldValue.increment(1) } },
 * ];
 * await batchWrite(db, operations);
 * ```
 */
export interface BatchOperation {
  readonly type: "set" | "update" | "delete";
  readonly ref: DocumentReference;
  readonly data?: Record<string, unknown>;
}

export async function batchWrite(
  db: Firestore,
  operations: readonly BatchOperation[],
): Promise<void> {
  const batch = db.batch();

  for (const op of operations) {
    if (op.type === "set") {
      batch.set(op.ref, op.data || {});
    } else if (op.type === "update") {
      batch.update(op.ref, op.data || {});
    } else if (op.type === "delete") {
      batch.delete(op.ref);
    }
  }

  await batch.commit();
}

/**
 * Count documents matching a query
 * More efficient than fetching all documents when you only need the count
 *
 * @param db Firestore instance
 * @param q Query to execute
 * @returns Number of matching documents
 * @throws Error if count operation fails
 *
 * @example
 * ```ts
 * const q = query(
 *   collection(db, "organizations/acme/schedules"),
 *   where("status", "==", "published")
 * );
 * const count = await countDocuments(db, q);
 * ```
 */
export async function countDocuments(db: Firestore, q: Query): Promise<number> {
  const snap = await q.count().get();
  return snap.data().count;
}

/**
 * Type guard to check if a value matches expected document shape
 * Useful before type assertion
 *
 * @template T The expected type
 * @param value Value to check
 * @param requiredFields Fields that must exist
 * @returns true if value has all required fields
 *
 * @example
 * ```ts
 * const data = snap.data();
 * if (isDocumentType<Schedule>(data, ["id", "name", "status"])) {
 *   const schedule = data as Schedule;
 * }
 * ```
 */
export function isDocumentType<T extends Record<string, unknown>>(
  value: unknown,
  requiredFields: readonly (string | number | symbol)[],
): value is T {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return requiredFields.every((field) => field in obj && obj[field as string] !== undefined);
}
