// netlify/functions/submission-created.js
export const handler = async (event) => {
  const base = (process.env.HBUK_API || "").replace(/\/+$/, "");
  const token = (process.env.HBUK_TOKEN || "").trim();
  const path = "/api/commit"; // we confirmed this is the working route

  if (!base || !token) {
    console.error("[CONFIG] Missing HBUK_API or HBUK_TOKEN");
    return { statusCode: 500, body: "config_error" };
  }

  // Build event from Netlify form payload
  let payload;
  try {
    const body = JSON.parse(event.body || "{}");
    const form = body?.payload?.data || {};
    const meta = body?.payload?.metadata || {};
    payload = {
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
      validation: { source: "netlify_form", form_name: body?.payload?.form_name || "beta", verified: true },
      timestamp_utc: new Date().toISOString(),
      provenance: { site: "safesound.ai", form: "beta", ip: meta?.ip || "", user_agent: meta?.user_agent || "" },
      data_rights: { mode: "utility", allowed_train_targets: [], export_ok: false, retention_days: 365 },
      evidence: []
    };
  } catch (e) {
    console.error("[PARSE]", e);
    return { statusCode: 500, body: "parse_error" };
  }

  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[HBUK] non-2xx:", res.status, text);
      return { statusCode: 500, body: "hubk_error" };
    }

    console.log("[HBUK] ok via", url);
    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("[FETCH]", e?.message || e);
    return { statusCode: 500, body: "net_error" };
  }
};
