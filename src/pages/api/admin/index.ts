import { NextApiRequest, NextApiResponse } from "next";
import getDb from "@/services/mongo";
import fs from "fs";
import path from "path";

interface Project {
  title: string;
  description?: string;
  link?: string;
  repo?: string;
  createdAt?: string;
}

function unauthorized(res: NextApiResponse) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
  return res.status(401).json({ error: 'Unauthorized' });
}

function checkBasicAuth(req: NextApiRequest): boolean {
  const auth = req.headers.authorization;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) return false;
  if (!auth) return false;

  const parts = auth.split(' ');
  if (parts.length !== 2) return false;
  const scheme = parts[0];
  const credentials = parts[1];
  if (!/^Basic$/i.test(scheme)) return false;

  try {
    const decoded = Buffer.from(credentials, 'base64').toString();
    const idx = decoded.indexOf(':');
    if (idx === -1) return false;
    const email = decoded.slice(0, idx);
    const password = decoded.slice(idx + 1);
    return email === adminEmail && password === adminPassword;
  } catch (e) {
    return false;
  }
}

const jsonFallbackPath = path.resolve(process.cwd(), 'data', 'projects.json');

async function readFallback(): Promise<Project[]> {
  try {
    if (!fs.existsSync(path.dirname(jsonFallbackPath))) {
      fs.mkdirSync(path.dirname(jsonFallbackPath), { recursive: true });
    }
    if (!fs.existsSync(jsonFallbackPath)) {
      fs.writeFileSync(jsonFallbackPath, JSON.stringify([]));
      return [];
    }
    const raw = fs.readFileSync(jsonFallbackPath, { encoding: 'utf-8' });
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Error reading fallback projects file', e);
    return [];
  }
}

async function writeFallback(projects: Project[]) {
  try {
    fs.writeFileSync(jsonFallbackPath, JSON.stringify(projects, null, 2));
  } catch (e) {
    console.error('Error writing fallback projects file', e);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Require Basic Auth
  if (!checkBasicAuth(req)) {
    return unauthorized(res);
  }

  // GET -> list projects
  if (req.method === 'GET') {
    try {
      if (process.env.MONGODB_URI) {
        const db = await getDb();
        const projects = await db.collection('projects').find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(projects as any);
      }

      const projects = await readFallback();
      return res.status(200).json(projects);
    } catch (e) {
      console.error('Error listing projects', e);
      return res.status(500).json({ error: 'Error listing projects' });
    }
  }

  // POST -> add project
  if (req.method === 'POST') {
    try {
      const body = req.body as Project | undefined;
      if (!body || !body.title || typeof body.title !== 'string') {
        return res.status(400).json({ error: 'Invalid payload: title is required' });
      }

      const project: Project = {
        title: body.title,
        description: body.description ?? '',
        link: body.link ?? '',
        repo: body.repo ?? '',
        createdAt: new Date().toISOString(),
      };

      if (process.env.MONGODB_URI) {
        const db = await getDb();
        const result = await db.collection('projects').insertOne(project);
        return res.status(201).json({ ...project, _id: result.insertedId });
      }

      const projects = await readFallback();
      projects.unshift(project);
      await writeFallback(projects);
      return res.status(201).json(project);
    } catch (e) {
      console.error('Error adding project', e);
      return res.status(500).json({ error: 'Error adding project' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end('Method Not Allowed');
}
