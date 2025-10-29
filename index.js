import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/send-telegram", async (req, res) => {
    const { name, phone, email, message } = req.body || {};

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const text = `📨 Nuevo contacto Siarl\n\n👤 ${name}\n📞 ${phone}\n✉️ ${email}\n\n💬 ${message}`;

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: "HTML"
            })
        });

        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
    }
});

app.get("/", (req, res) => res.send("Telegram API OK ✅"));

app.listen(3000, () =>
    console.log("✅ API corriendo en puerto 3000")
);
