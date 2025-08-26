// netlify/functions/submission-created.js
export const handler = async (event) => {
  const base = (process.env.HBUK_API || "").replace(/\/+$/, "");
  const token = (process.env.HBUK_TOKEN || "").trim();
  const path = process.env.HBUK_EVENTS_PATH || "/api/events"; // <-- configurable

  if (!base || !token) {
    console.error("[CONFIG] Missing HBUK_API or HBUK_TOKEN");
    return { statusCode: 500, body: "config_error" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const payload = body?.payload || {};
    const data = payload?.data || {};
    const meta = payload?.metadata || {};

    const evt = {
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

    const url = `${base}${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Authorization": token, "Content-Type": "application/json" },
      body: JSON.stringify(evt),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[HBUK] non-2xx:", res.status, text.slice(0, 200));
      return { statusCode: 500, body: "hubk_error" };
    }

    console.log("[HBUK] ok");
    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("[FN ERROR]", e);
    return { statusCode: 500, body: "fn_error" };
  }
};
