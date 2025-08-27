// netlify/functions/submission-created.js
export const handler = async (event) => {
  const base = (process.env.HBUK_API || "").replace(/\/+$/, "");
  const token = (process.env.HBUK_TOKEN || "").trim();
  const url = `${base}/api/commit`;
  if (!base || !token) return { statusCode: 500, body: "config_error" };

  const { payload = {} } = JSON.parse(event.body || "{}");
  const form = payload.data || {};
  const meta = payload.metadata || {};

  const content = {
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

  const body = { /* device_id: "website-netlify-01", */ content };

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[HBUK] non-2xx:", res.status, text);
    return { statusCode: 500, body: "hubk_error" };
  }
  console.log("[HBUK] ok via", url);
  return { statusCode: 200, body: "ok" };
};
