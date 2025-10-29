import { z } from 'zod';
import { parseJson, badRequest, serverError, ok } from '../_shared/validation';
import { verifyIdToken, adminDb, isManagerClaims, adminSdk } from '../../../src/lib/firebase.server';

const PublishSchema = z.object({
  scheduleId: z.string().min(1),
  orgId: z.string().min(1),
  publish: z.boolean().optional().default(true)
});

export async function POST(req: Request) {
  try {
    const parsed = await parseJson(req, PublishSchema);
    if (!parsed.success) return badRequest('Invalid payload', parsed.details);
  const { scheduleId, orgId } = parsed.data;

    // verify Authorization header (Bearer token)
    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) return badRequest('Missing Authorization header', null, 'UNAUTHORIZED');
    const token = auth.split(' ')[1];

    const decoded = await verifyIdToken(token).catch(() => {
      throw new Error('Invalid token');
    });

    if (!isManagerClaims(decoded, orgId)) return badRequest('Insufficient permissions', null, 'FORBIDDEN');

    if (!adminDb || !adminSdk) return serverError('Admin DB not initialized');

    const FieldValue = adminSdk.firestore.FieldValue;
    const scheduleRef = adminDb.doc(`organizations/${orgId}/schedules/${scheduleId}`);
    await scheduleRef.set({ state: 'published', publishedAt: FieldValue.serverTimestamp() }, { merge: true });

    // create message
    const msgRef = adminDb.collection(`organizations/${orgId}/messages`).doc();
    await msgRef.set({
      type: 'publish_notice',
      title: 'Schedule Published',
      body: 'The latest schedule has been published. Check your shifts.',
      targets: 'members',
      recipients: [],
      scheduleId,
      createdAt: FieldValue.serverTimestamp()
    });

    return ok({ success: true });
  } catch (err: unknown) {
  const maybeMessage = (err && typeof err === 'object' && 'message' in err) ? (err as Record<string, unknown>)['message'] : undefined;
  const msg = typeof maybeMessage === 'string' ? maybeMessage : String(err);
  return serverError(msg || 'Unexpected error');
  }
}
