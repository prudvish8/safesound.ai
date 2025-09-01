// netlify/functions/beta.js
export default async (req, context) => {
  // Only POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const HBUK_API = process.env.HBUK_API || 'https://hbuk-backend-hvow.onrender.com';
    const HBUK_TOKEN = process.env.HBUK_TOKEN; // set in Netlify env: "Bearer x.y.z"

    if (!HBUK_TOKEN) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { name = '', email = '', use_case = '', note = '', website = '' } = body;

    // Honeypot (bots fill hidden field "website")
    if (website) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // Minimal validation
    if (!name.trim() || !email.trim()) {
      return new Response(JSON.stringify({ error: 'Name and email required' }), { status: 400 });
    }

    // Build high-fidelity event
    const event = {
      event: 'beta_signup',
      source: 'safesound.ai',
      timestamp_utc: new Date().toISOString(),
      payload: {
        name: name.trim(),
        email: email.trim(),
        use_case: String(use_case || ''),
        note: String(note || '')
      },
      validation: {
        // These may be blank in some environments; still useful when present
        source_ip: req.headers.get('x-nf-client-connection-ip') || '',
        user_agent: req.headers.get('user-agent') || ''
      }
    };

    // Commit to HBUK as a structured string (preserves your append-only semantics)
    const commitRes = await fetch(`${HBUK_API}/api/commit`, {
      method: 'POST',
      headers: {
        'Authorization': HBUK_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: JSON.stringify(event) })
    });

    if (!commitRes.ok) {
      const text = await commitRes.text();
      return new Response(JSON.stringify({ error: 'Failed to submit to HBUK', details: text }), { status: 502 });
    }

    const saved = await commitRes.json();
    return new Response(JSON.stringify({ ok: true, id: saved?._id || null }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to submit to HBUK' }), { status: 500 });
  }
}
