// netlify/functions/submission-created.js
export const handler = async (event) => {
  try {
    const base = process.env.HBUK_API;
    const token = process.env.HBUK_TOKEN;
    if (!base || !token) {
      console.error("[CONFIG] Missing HBUK_API or HBUK_TOKEN");
      return { statusCode: 500, body: "config_error" };
    }

    const body = JSON.parse(event.body || "{}");
    const payload = body?.payload || {};
    const data = payload?.data || {};
    const meta = payload?.metadata || {};

    const now = new Date().toISOString();
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
      validation: {
        source: "netlify_form",
        form_name: payload?.form_name || "beta",
        verified: true,
      },
      timestamp_utc: now,
      provenance: {
        site: "safesound.ai",
        form: "beta",
        ip: meta?.ip || "",
        user_agent: meta?.user_agent || "",
        referer: meta?.referer || "",
      },
      data_rights: {
        mode: "utility",
        allowed_train_targets: [],
        export_ok: false,
        retention_days: 365,
      },
      evidence: [],
    };

    const res = await fetch(`${base}/api/v1/events`, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evt),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[HBUK] non-2xx:", res.status, text);
      return { statusCode: 500, body: "hubk_error" };
    }

    console.log("[HBUK] ok");
    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("[FN ERROR]", e);
    return { statusCode: 500, body: "fn_error" };
  }
};
