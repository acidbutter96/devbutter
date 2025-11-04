import { NextApiRequest, NextApiResponse } from 'next';
import getDb from '@/services/mongo';
import { comparePassword, createSessionForUser } from '@/services/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: String(email).toLowerCase() });
    if (!user || !user.hash_password) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await comparePassword(String(password), user.hash_password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const session = await createSessionForUser(String(user._id));
    return res.status(200).json({ token: session.token, expiresAt: session.expiresAt });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
