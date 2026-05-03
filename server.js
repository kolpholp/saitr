import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// env
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// API
app.post("/api/lead", async (req, res) => {
  try {
    const { name, phone, product, comment } = req.body;

    if (!name || !phone || !product) {
      return res.status(400).json({
        ok: false,
        error: "Заполните имя, телефон и тип мебели"
      });
    }

    if (!BOT_TOKEN || !CHAT_ID) {
      console.log("Telegram не настроен");
      return res.json({ ok: true });
    }

    const text = [
      "Новая заявка с сайта Квадро",
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Заказ: ${product}`,
      `Комментарий: ${comment || "-"}`
    ].join("\n");

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
      console.log("Ошибка Telegram:", data);
      return res.status(500).json({ ok: false });
    }

    return res.json({ ok: true });

  } catch (err) {
    console.log("Ошибка сервера:", err);
    return res.status(500).json({ ok: false });
  }
});

// проверка
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
