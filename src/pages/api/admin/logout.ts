import { NextApiRequest, NextApiResponse } from 'next';
import { verifyTokenAndSession, destroySession } from '@/services/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const session = await verifyTokenAndSession(req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    await destroySession(session.token);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
