export const handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);
    const data = payload?.payload?.data || {};
    const now = new Date().toISOString();

    const evt = {
      event: "lead_signup",
      rule: "netlify_form_v1",
      result: "ok",
      subject: "beta_waitlist",
      context: { name: data.name, email: data.email, use_case: data.use_case, notes: data.notes || "" },
      validation: { source: "netlify_form", form_name: payload?.payload?.form_name },
      timestamp_utc: now,
      provenance: { site: "safesound.ai", form: "beta" },
      data_rights: { mode: "utility", allowed_train_targets: [], export_ok: false, retention_days: 365 },
      evidence: []
    };

    const res = await fetch(`${process.env.HBUK_API}/api/v1/events`, {
      method: "POST",
      headers: {
        Authorization: process.env.HBUK_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(evt)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("HBUK error:", res.status, text);
      return { statusCode: 500 };
    }

    return { statusCode: 200 };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500 };
  }
};
