import fs from "fs";
import path from "path";
import getDb from "./mongo";

export interface ProjectRecord {
  _id?: string;
  title: string;
  description?: string;
  link?: string;
  repo?: string;
  createdAt?: string;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  link: string;
  repo?: string;
}

const jsonFallbackPath = path.resolve(process.cwd(), "data", "projects.json");

function ensureFallbackFile() {
  const dir = path.dirname(jsonFallbackPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(jsonFallbackPath)) {
    fs.writeFileSync(jsonFallbackPath, JSON.stringify([]));
  }
}

function normalizeProject(doc: any): ProjectRecord {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    ...rest,
    _id: _id ? String(_id) : undefined,
  };
}

async function readFallback(): Promise<ProjectRecord[]> {
  try {
    ensureFallbackFile();
    const raw = fs.readFileSync(jsonFallbackPath, { encoding: "utf-8" });
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Error reading fallback projects", err);
    return [];
  }
}

async function writeFallback(projects: ProjectRecord[]) {
  try {
    ensureFallbackFile();
    fs.writeFileSync(jsonFallbackPath, JSON.stringify(projects, null, 2));
  } catch (err) {
    console.error("Error writing fallback projects", err);
  }
}

export async function listProjects(): Promise<ProjectRecord[]> {
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const projects = await db.collection("projects").find({}).sort({ createdAt: -1 }).toArray();
      return projects.map(normalizeProject);
    } catch (err) {
      console.error("Error querying Mongo projects", err);
      return [];
    }
  }

  return readFallback();
}

export async function addProject(input: CreateProjectInput): Promise<ProjectRecord | null> {
  const projectDoc: Omit<ProjectRecord, "_id"> = {
    title: input.title,
    description: input.description ?? "",
    link: input.link,
    repo: input.repo ?? "",
    createdAt: new Date().toISOString(),
  };

  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      const result = await db.collection("projects").insertOne(projectDoc);
      return normalizeProject({ ...projectDoc, _id: result.insertedId });
    } catch (err) {
      console.error("Error inserting Mongo project", err);
      return null;
    }
  }

  const projects = await readFallback();
  const nextProjects = [projectDoc, ...projects];
  await writeFallback(nextProjects);
  return projectDoc;
}
