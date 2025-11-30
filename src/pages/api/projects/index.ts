import type { NextApiRequest, NextApiResponse } from "next";
import { listProjects } from "@/services/projectsStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const projects = await listProjects();
    return res.status(200).json(projects);
  } catch (err) {
    console.error("Error loading public projects", err);
    return res.status(500).json({ error: "Unable to load projects" });
  }
}
