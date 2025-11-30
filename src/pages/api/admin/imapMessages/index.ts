import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyTokenAndSession } from '@/services/auth';
import { getDb } from '@/services/mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // only allow authenticated admin sessions
  try {
    const session = await verifyTokenAndSession(req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 25)));
  const skip = (page - 1) * limit;

  try {
    const db = await getDb();
    const coll = db.collection('imapMessages');

    const [items, total] = await Promise.all([
      coll
        .find({})
        .sort({ processedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      coll.countDocuments(),
    ]);

    return res.status(200).json({ ok: true, page, limit, total, items });
  } catch (err: any) {
    console.error('Failed to list imapMessages', err);
    return res.status(500).json({ ok: false, error: String(err?.message ?? err) });
  }
}
