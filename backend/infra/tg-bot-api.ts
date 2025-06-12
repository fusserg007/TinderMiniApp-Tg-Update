interface TelegramResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
}

class TgBotApi {
  #token: string;
  #host: string;

  constructor() {
    this.#token = process.env.BOT_TOKEN || "";
    
    // Определяем хост API в зависимости от режима тестирования
    if (process.env.TEST_MODE === 'true') {
      this.#host = "https://api.telegram.org"; // Тестовый сервер использует тот же API endpoint
      console.log("🧪 Режим тестового сервера Telegram активирован");
    } else {
      this.#host = "https://api.telegram.org";
    }
    
    console.log("🤖 Bot token:", this.#token ? '✅ Установлен' : '❌ Отсутствует');
    console.log("🌐 API Host:", this.#host);
  }

  async setWebhook() {
    const url = process.env.WEBHOOK_URL || process.env.BACKEND_URL || "";
    
    // В тестовом режиме разрешаем HTTP webhook
    if (process.env.TEST_MODE === 'true' && process.env.ALLOW_HTTP === 'true') {
      console.log("🧪 Настройка webhook для тестового сервера:", `${url}`);
      try {
        const result = await this.query("setWebhook", { 
          url: url,
          allowed_updates: ["message", "pre_checkout_query", "callback_query"]
        });
        console.log("✅ Webhook успешно установлен для тестового сервера");
        return result;
      } catch (error) {
        console.error("❌ Ошибка установки webhook:", error);
        throw error;
      }
    }
    
    // Для продакшена требуем HTTPS
    if (url.startsWith('https://')) {
      console.log("🔒 Настройка HTTPS webhook для продакшена:", `${url}`);
      return this.query("setWebhook", { 
        url: url,
        allowed_updates: ["message", "pre_checkout_query", "callback_query"]
      });
    } else {
      console.log("⚠️ Пропуск настройки webhook (требуется HTTPS для продакшена):", url);
      console.log("💡 Для тестирования установите TEST_MODE=true и ALLOW_HTTP=true в .env");
      return Promise.resolve();
    }
  }

  async query<T>(method: string, body?: Record<any, any>): Promise<T> {
    const pathNameChunks = ["", `bot${this.#token}`, method].filter((chunk) => {
      return typeof chunk === "string";
    });
    const path = pathNameChunks.join("/");

    const url = new URL(path, this.#host);
    console.log("Making request to:", url.toString());
    console.log("With body:", JSON.stringify(body));

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as TelegramResponse<T>;
    console.log("Response:", JSON.stringify(data));

    if (!data.ok) {
      throw new Error(data.description || "Unknown error");
    }

    return data.result;
  }
}

export default TgBotApi;
