import { NextApiRequest, NextApiResponse } from "next";
import getDb from "@/services/mongo";

interface FormBody {
  name?: string;
  email?: string;
  message?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body: FormBody = req.body ?? {};

  // minimal validation
  if (!body.name || !body.email) {
    return res.status(400).json({ error: "Missing required fields: name and email" });
  }

  try {
    const db = await getDb();
    const collection = db.collection("formSubmissions");

    const doc = {
      name: body.name,
      email: body.email,
      message: body.message ?? null,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error("Error saving form submission:", error);
    return res.status(500).json({ error: "Error saving form submission" });
  }
}
