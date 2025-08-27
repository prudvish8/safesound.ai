// netlify/functions/submission-created.js
import nacl from "tweetnacl";
import * as u from "tweetnacl-util";

export const handler = async (event) => {
  const base = (process.env.HBUK_API || "").replace(/\/+$/, "");
  const token = (process.env.HBUK_TOKEN || "").trim();
  const path = process.env.HBUK_EVENTS_PATH || "/api/commit";
  const seedB64 = (process.env.HBUK_DEVICE_SEED || "").trim();

  if (!base || !token) return { statusCode: 500, body: "config_error" };
  if (!seedB64) { console.error("[CONFIG] Missing HBUK_DEVICE_SEED"); return { statusCode: 500, body: "config_error" }; }

  const seed = u.decodeBase64(seedB64);
  if (seed.length !== 32) { console.error("[CONFIG] Seed must be 32 bytes base64"); return { statusCode: 500, body: "config_error" }; }

  const kp = nacl.sign.keyPair.fromSeed(seed);

  const { payload = {} } = JSON.parse(event.body || "{}");
  const form = payload.data || {};
  const meta = payload.metadata || {};

  const contentObj = {
    event: "lead_signup",
    rule: "netlify_form_v1",
    result: "ok",
    subject: "beta_waitlist",
    context: {
      name: form.name || "",
      email: form.email || "",
      use_case: form.use_case || "",
      notes: form.notes || "",
    },
    validation: { source: "netlify_form", form_name: payload.form_name || "beta", verified: true },
    timestamp_utc: new Date().toISOString(),
    provenance: { site: "safesound.ai", form: "beta", ip: meta.ip || "", user_agent: meta.user_agent || "" },
    data_rights: { mode: "utility", allowed_train_targets: [], export_ok: false, retention_days: 365 },
    evidence: []
  };

  const contentStr = JSON.stringify(contentObj);
  const sig = nacl.sign.detached(u.decodeUTF8(contentStr), kp.secretKey);

  const body = {
    device_id: "website-netlify-01",
    content: contentStr,                     // string
    pubkey: u.encodeBase64(kp.publicKey),    // base64
    sig:    u.encodeBase64(sig)              // base64
  };

  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[HBUK] non-2xx:", res.status, text);
    return { statusCode: 500, body: "hubk_error" };
  }
  console.log("[HBUK] ok via", `${base}${path}`);
  return { statusCode: 200, body: "ok" };
};
