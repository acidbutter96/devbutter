import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import getDb from '@/services/mongo';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

if (!JWT_SECRET) {
  // we don't throw at import time to keep developer experience flexible,
  // but functions will check and error if needed.
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionForUser(userId: string) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
  const db = await getDb();
  const sessions = db.collection('sessions');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEFAULT_EXPIRES_MS);
  await sessions.insertOne({ token, userId: new ObjectId(userId), createdAt: now, expiresAt });
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  const db = await getDb();
  const sessions = db.collection('sessions');
  await sessions.deleteOne({ token });
}

export async function verifyTokenAndSession(req: NextApiRequest) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  const auth = req.headers.authorization;
  if (!auth) return null;
  const parts = String(auth).split(' ');
  if (parts.length !== 2) return null;
  const scheme = parts[0];
  const credentials = parts[1];
  if (!/^Bearer$/i.test(scheme)) return null;
  try {
    const payload: any = jwt.verify(credentials, JWT_SECRET);
    const token = credentials;
    const db = await getDb();
    const sessions = db.collection('sessions');
    const session = await sessions.findOne({ token });
    if (!session) return null;
    const now = new Date();
    if (session.expiresAt && session.expiresAt < now) return null;
    return { userId: String(payload.sub), token };
  } catch (err) {
    return null;
  }
}

export function unauthorized(res: NextApiResponse) {
  return res.status(401).json({ error: 'Unauthorized' });
}
