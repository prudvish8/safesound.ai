// netlify/functions/submission-created.js
export const handler = async (event) => {
  const base = (process.env.HBUK_API || "").replace(/\/+$/, "");
  const token = (process.env.HBUK_TOKEN || "").trim();

  if (!base || !token) {
    console.error("[CONFIG] Missing HBUK_API or HBUK_TOKEN");
    return { statusCode: 500, body: "config_error" };
  }

  // Candidate endpoints (first 2xx wins)
  const candidates = [
    process.env.HBUK_EVENTS_PATH,  // optional override from env
    "/api/events",
    "/api/v1/events",
    "/api/commit",
    "/api/v1/commit",
    "/events",
    "/commit",
  ].filter(Boolean);

  let body;
  try {
    const parsed = JSON.parse(event.body || "{}");
    const payload = parsed?.payload || {};
    const data = payload?.data || {};
    const meta = payload?.metadata || {};

    body = {
      event: "lead_signup",
      rule: "netlify_form_v1",
      result: "ok",
      subject: "beta_waitlist",
      context: {
        name: data.name || "",
        email: data.email || "",
        use_case: data.use_case || "",
        notes: data.notes || "",
      },
      validation: { source: "netlify_form", form_name: payload?.form_name || "beta", verified: true },
      timestamp_utc: new Date().toISOString(),
      provenance: { site: "safesound.ai", form: "beta", ip: meta?.ip || "", user_agent: meta?.user_agent || "" },
      data_rights: { mode: "utility", allowed_train_targets: [], export_ok: false, retention_days: 365 },
      evidence: [],
    };
  } catch (e) {
    console.error("[PARSE]", e);
    return { statusCode: 500, body: "parse_error" };
  }

  for (const path of candidates) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": token, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        console.log("[HBUK] ok via", url);
        return { statusCode: 200, body: "ok" };
      }
      const text = await res.text();
      console.warn("[HBUK] try", url, "→", res.status, text.slice(0, 160));
    } catch (e) {
      console.warn("[HBUK] fetch error", url, e?.message || e);
    }
  }

  console.error("[HBUK] all paths failed");
  return { statusCode: 500, body: "hubk_error" };
};
