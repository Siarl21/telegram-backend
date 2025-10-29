// index.js (Railway)
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// CORS: permite tu dominio de Vercel y localhost
const whitelist = [
  "http://localhost:5173",
  "https://siarl-interactive.vercel.app",           // tu dominio principal
  /\.vercel\.app$/                                   // cualquier preview *.vercel.app
];

const corsOptions = {
  origin(origin, cb) {
    // permitir sin Origin (algunos bots/monitores)
    if (!origin) return cb(null, true);

    const ok = whitelist.some(rule =>
      rule instanceof RegExp ? rule.test(origin) : rule === origin
    );
    return ok ? cb(null, true) : cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  optionsSuccessStatus: 204
};

// Habilita CORS y JSON
app.use(cors(corsOptions));
app.use(express.json());

// Por si algún proxy intermedio cachea por Origin
app.use((req, res, next) => {
  res.setHeader("Vary", "Origin");
  next();
});

// Endpoint
app.post("/send-telegram", async (req, res) => {
  try {
    const { name, phone, email, message } = req.body || {};
    if (!name || !phone || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ ok: false, error: "Server env missing" });
    }

    const text = `📨 <b>Nuevo contacto Siarl</b>\n\n` +
                 `👤 <b>Nombre:</b> ${name}\n` +
                 `📞 <b>WhatsApp:</b> ${phone}\n` +
                 `✉️ <b>Email:</b> ${email}\n\n` +
                 `💬 <b>Mensaje:</b>\n${message}`;

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" })
    });

    const data = await tg.json();
    if (!data.ok) throw new Error(data.description || "Telegram error");

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Salud
app.get("/", (_, res) => res.send("Telegram API OK ✅"));

// Puerto Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ API corriendo en", PORT));
