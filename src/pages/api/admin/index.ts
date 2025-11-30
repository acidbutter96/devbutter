import { NextApiRequest, NextApiResponse } from "next";
import { verifyTokenAndSession, unauthorized as authUnauthorized } from "@/services/auth";
import { addProject, listProjects, type CreateProjectInput } from "@/services/projectsStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Require valid session token
  try {
    const session = await verifyTokenAndSession(req);
    if (!session) return authUnauthorized(res);
  } catch (err) {
    console.error('Auth check failed', err);
    return authUnauthorized(res);
  }

  // GET -> list projects
  if (req.method === 'GET') {
    try {
      const projects = await listProjects();
      return res.status(200).json(projects);
    } catch (e) {
      console.error('Error listing projects', e);
      return res.status(500).json({ error: 'Error listing projects' });
    }
  }

  // POST -> add project
  if (req.method === 'POST') {
    try {
      const body = req.body as CreateProjectInput | undefined;
      const title = body?.title?.trim();
      const link = body?.link?.trim();

      if (!title) {
        return res.status(400).json({ error: 'Invalid payload: title is required' });
      }

      if (!link) {
        return res.status(400).json({ error: 'Invalid payload: link is required' });
      }

      const created = await addProject({
        title,
        link,
        description: body?.description ?? '',
        repo: body?.repo ?? '',
      });

      if (!created) {
        return res.status(500).json({ error: 'Unable to create project' });
      }

      return res.status(201).json(created);
    } catch (e) {
      console.error('Error adding project', e);
      return res.status(500).json({ error: 'Error adding project' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end('Method Not Allowed');
}
