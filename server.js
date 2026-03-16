/**
 * Local development server
 * Usage: npm start
 * http://localhost:5000
 */

require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── API ───────────────────────────────────────────────────────────────────────

app.post("/api/submit-contact", async (req, res) => {
  const { name = "", email = "", phone, service, message, recaptcha_token } = req.body ?? {};

  if (!name.trim() || !email.trim()) {
    return res.status(400).json({ error: "姓名和电子邮箱为必填项" });
  }

  // Verify reCAPTCHA token
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (secretKey && secretKey !== "YOUR_RECAPTCHA_SECRET_KEY") {
    if (!recaptcha_token) {
      return res.status(400).json({ error: "reCAPTCHA 验证失败" });
    }
    const verifyRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptcha_token}`,
      { method: "POST" }
    );
    const verifyData = await verifyRes.json();
    if (!verifyData.success || verifyData.score < 0.5) {
      return res.status(400).json({ error: "reCAPTCHA 验证失败，请重试" });
    }
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { error } = await supabase.from("contacts").insert({
    name:    name.trim(),
    email:   email.trim(),
    phone:   phone?.trim() || null,
    service: service?.trim() || null,
    message: message?.trim() || null,
  });

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "服务器错误，请稍后再试" });
  }

  res.json({ success: true });
});

// ── Fallback → index.html ─────────────────────────────────────────────────────

app.get("/{*path}", (_, res) => res.sendFile(path.join(__dirname, "index.html")));

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
