interface TelegramResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
}

class TgBotApi {
  #token: string;
  #host: string = "https://api.telegram.org";

  constructor() {
    this.#token = process.env.BOT_TOKEN || "";
    console.log("Bot token:", this.#token);
  }

  async setWebhook() {
    const url = process.env.BACKEND_URL || "";
    
    // Устанавливаем webhook только для HTTPS URL (для продакшена)
    if (url.startsWith('https://')) {
      console.log("Setting webhook URL:", `${url}/webhook`);
      return this.query("setWebhook", { url: `${url}/webhook` });
    } else {
      console.log("Skipping webhook setup for local development (HTTP URL):", url);
      console.log("Webhook будет установлен только для HTTPS URL в продакшене");
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
