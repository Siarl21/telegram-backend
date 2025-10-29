// index.js  (ESM)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

// Dominios que SÍ pueden llamar a la API
const allowedOrigins = [
  "https://siarl-interactive.vercel.app",          // tu prod en Vercel
  /\.vercel\.app$/,                                // cualquier preview *.vercel.app
  "http://localhost:5173",                         // dev local (Vite)
];

const corsOptions = {
  origin(origin, cb) {
    // permitir tools como curl/postman (sin origin)
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some((o) =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    cb(ok ? null : new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  maxAge: 86400,
};

// Responder el preflight
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Health
app.get("/", (_req, res) => res.send("Telegram API OK ✅"));
app.get("/health", (_req, res) => res.json({ ok: true }));

// Envío a Telegram
app.post("/send-telegram", async (req, res) => {
  try {
    const { name, phone, email, message } = req.body || {};
    if (!name || !phone || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return res.status(500).json({ ok: false, error: "Missing env vars" });
    }

    const text =
      `📨 <b>Nuevo contacto Siarl</b>\n\n` +
      `👤 <b>Nombre:</b> ${name}\n` +
      `📞 <b>WhatsApp:</b> ${phone}\n` +
      `✉️ <b>Email:</b> ${email}\n\n` +
      `💬 <b>Mensaje:</b>\n${message}`;

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });

    const data = await tg.json();
    if (!data.ok) throw new Error(data.description || "Telegram error");

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ API escuchando en :${PORT}`)
);
