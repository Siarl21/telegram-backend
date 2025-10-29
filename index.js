import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Permitir solo tu dominio de producción
app.use(cors({
    origin: [
        "https://siarl-interactive-wwcjn4hs0-siarls-projects.vercel.app/", // Cambiar si tu dominio es diferente
        "http://localhost:5173"     // Para pruebas en local
    ],
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"]
}));

// ✅ Manejo de preflight OPTIONS (muy importante para CORS)
app.options("*", cors());

app.post("/send-telegram", async (req, res) => {
    const { name, phone, email, message } = req.body || {};

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        return res.status(500).json({ ok: false, error: "Missing Telegram ENV" });
    }

    const text = `📨 Nuevo contacto Siarl\n\n` +
        `👤 Nombre: ${name}\n` +
        `📞 WhatsApp: ${phone}\n` +
        `✉️ Email: ${email}\n\n` +
        `💬 Mensaje:\n${message}`;

    try {
        const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: "HTML"
            })
        });

        const data = await tg.json();
        if (!data.ok) throw new Error(data.description);

        return res.json({ ok: true });
    } catch (err) {
        console.error("Telegram error:", err);
        return res.status(500).json({ ok: false, error: err.message });
    }
});

// ✅ Endpoint de prueba
app.get("/", (req, res) => res.send("Telegram API OK ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`✅ API corriendo en puerto ${PORT}`)
);
