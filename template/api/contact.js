// Vercel serverless function — no framework, no dependencies, plain fetch
// to Resend's HTTP API. Reads RESEND_API_KEY (and optional CONTACT_TO_EMAIL)
// from Vercel project environment variables — never hardcoded, never committed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const website = (body.website || "").toString().trim();
  const goal = (body.goal || "").toString().trim();
  const honeypot = (body["company-website"] || "").toString().trim();

  // Bots that auto-fill every field trip the honeypot; pretend success so
  // they don't learn it's being filtered.
  if (honeypot) {
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !goal) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Server not configured" });
  }
  const toEmail = process.env.CONTACT_TO_EMAIL || "nolanb.shepherd@gmail.com";

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cascade Growth Form <onboarding@resend.dev>",
        to: toEmail,
        reply_to: email,
        subject: `New growth plan request from ${name}`,
        text:
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Website: ${website || "(not provided)"}\n\n` +
          `What they want to grow:\n${goal}`,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Resend API error:", r.status, errText);
      return res.status(502).json({ error: "Failed to send" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact form submission failed:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
