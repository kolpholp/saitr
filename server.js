import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===== middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ===== env =====
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ===== health check =====
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ===== lead form =====
app.post("/api/lead", async (req, res) => {
  try {
    console.log("📩 DATA:", req.body);

    const { name, phone, product, comment } = req.body;

    // мягкая валидация (не ломает фронт)
    if (!name || !phone) {
      return res.json({
        ok: false,
        error: "Введите имя и телефон"
      });
    }

    // если нет телеги — просто не падаем
    if (!BOT_TOKEN || !CHAT_ID) {
      console.log("⚠ Telegram не настроен");
      return res.json({ ok: true });
    }

    const text = `
📩 Новая заявка с сайта Квадро

👤 Имя: ${name}
📞 Телефон: ${phone}
📦 Заказ: ${product || "-"}
💬 Комментарий: ${comment || "-"}
`;

    const tg = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text
      })
    });

    const data = await tg.json();

    if (!data.ok) {
      console.log("❌ Ошибка Telegram:", data);
      return res.json({ ok: false });
    }

    return res.json({ ok: true });

  } catch (err) {
    console.log("❌ Ошибка сервера:", err);
    return res.json({ ok: false });
  }
});

// ===== fallback (чтобы SPA не ломалась) =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===== запуск =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
