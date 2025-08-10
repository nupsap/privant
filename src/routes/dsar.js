import express from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { sendEmail } from "../lib/email.js";

export const router = express.Router();

const DsArInput = z.object({
  jurisdiction: z.string().min(2),
  privacy_right: z.string().min(2),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  customer_type: z.enum(["Consumer", "Employee", "Applicant", "Other"]),
  reference_id: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
});

// Public: submit a DSAR
router.post("/", async (req, res) => {
  const parse = DsArInput.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  const payload = parse.data;
  const { data, error } = await supabase
    .from("dsar_requests")
    .insert(payload)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });

  // Fire-and-forget notification
  sendEmail("New DSAR submitted", `<pre>${JSON.stringify(data, null, 2)}</pre>`);
  return res.json({ ok: true, dsar: data });
});

// Admin: list DSARs
router.get("/", async (req, res) => {
  const apiKey = req.get("x-api-key");
  if (apiKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabase.from("dsar_requests").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ dsars: data });
});

// Admin: update DSAR status
router.patch("/:id/status", async (req, res) => {
  const apiKey = req.get("x-api-key");
  if (apiKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  const { status } = req.body || {};
  const valid = ["received", "in_progress", "fulfilled", "rejected", "closed"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Bad status" });
  const { data, error } = await supabase
    .from("dsar_requests")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, dsar: data });
});
