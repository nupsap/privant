import express from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";

export const router = express.Router();

const ConsentInput = z.object({
  subject_email: z.string().email(),
  consent_type: z.string().min(2),
  preference: z.boolean(),
  source: z.string().optional(),
  policy_version: z.string().optional(),
});

router.post("/", async (req, res) => {
  const parse = ConsentInput.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
    }
  const payload = parse.data;
  const { data, error } = await supabase.from("consents").insert(payload).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, consent: data });
});
