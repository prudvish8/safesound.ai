// netlify/functions/beta.js
import jwt from "jsonwebtoken";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, useCase, notes } = JSON.parse(event.body || "{}");

    // Basic validation
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "name and email are required" }),
      };
    }

    // Build high-fidelity event
    const payload = {
      event: "beta_signup",
      source: "safesound.ai",
      timestamp_utc: new Date().toISOString(),
      payload: { name, email, use_case: useCase || null, notes: notes || null },
      validation: {
        source_ip:
          event.headers["x-nf-client-connection-ip"] ||
          event.headers["client-ip"] ||
          null,
      },
    };

    // Mint short-lived JWT (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      {
        sub: "service@safesound.ai",
        email: "service@safesound.ai",
        iss: "hbuk",
        aud: "hbuk",
        iat: now,
        exp: now + 300,
      },
      process.env.HBUK_JWT_SECRET,
      { algorithm: "HS256" }
    );

    // Build HBUK endpoint
    const base = process.env.HBUK_API;               // e.g. https://hbuk-backend-hvow.onrender.com
    const path = process.env.HBUK_EVENTS_PATH || "/api/commit";
    const url = `${base}${path}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        device_id: process.env.HBUK_DEVICE_SEED || "safesound-beta",
        content: JSON.stringify(payload),
      }),
    });

    // Bubble up helpful errors
    if (!res.ok) {
      const text = await res.text();
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "Failed to submit to HBUK", detail: text }),
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, hbuk: data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", detail: err.message }),
    };
  }
};