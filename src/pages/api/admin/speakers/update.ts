import type { NextApiRequest, NextApiResponse } from "next";
import { speakerTable } from "@/lib/airtable";

function isAdmin(req: NextApiRequest) {
  return req.cookies?.[process.env.ADMIN_SESSION_COOKIE || "asb_admin"] === "1";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const { recordId, fields } = req.body as { recordId: string; fields: Record<string, any> };
  if (!recordId || !fields) return res.status(400).json({ error: "Missing payload" });

  try {
    const table = speakerTable();
    const [updated] = await table.update([{ id: recordId, fields }], { typecast: true });
    return res.status(200).json({ ok: true, record: updated });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Update failed" });
  }
}
