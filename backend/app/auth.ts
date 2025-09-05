import crypto from "node:crypto";
import { nanoid } from "nanoid";

import { ObjectStorage } from "../infra/object-storage";
import { DI } from "../infra/di";
import { ValidationError } from "./errors/validation-error";

import type { User } from "../domain/user.js";
import type { MongoStore } from "../infra/mongo-store.js";

interface TelegramUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  languageCode: string;
}

class Auth {
  #cookieName = "session_id";

  #store: MongoStore | null = null;

  #objectStorage: ObjectStorage;

  constructor() {
    try {
      this.#store = DI.get().store;
    } catch (error) {
      console.warn('⚠️ MongoDB недоступен, Auth работает в режиме без базы данных');
      this.#store = null;
    }
    this.#objectStorage = new ObjectStorage();
  }

  get cookieName(): string {
    return this.#cookieName;
  }

  get #users() {
    if (!this.#store) {
      throw new Error('MongoDB недоступен');
    }
    return this.#store.users;
  }

  get #sessions() {
    if (!this.#store) {
      throw new Error('MongoDB недоступен');
    }
    return this.#store.sessions;
  }

  async getUserFromSession(sessionId: string): Promise<User | null> {
    if (!this.#store) {
      console.warn('⚠️ MongoDB недоступен, возвращаем null для getUserFromSession');
      return null;
    }
    
    try {
      const session = await this.#sessions.findOne({ id: sessionId });
      const user = session ? await this.getUserById(session.userId) : null;
      return user;
    } catch (error) {
      console.warn('⚠️ Ошибка при получении пользователя из сессии:', (error as Error).message);
      return null;
    }
  }

  async getUserById(userId: User["id"]): Promise<User | null> {
    if (!this.#store) {
      console.warn('⚠️ MongoDB недоступен, возвращаем null для getUserById');
      return null;
    }
    
    try {
      const user = await this.#users.findOne({ id: userId });
      return user;
    } catch (error) {
      console.warn('⚠️ Ошибка при получении пользователя по ID:', (error as Error).message);
      return null;
    }
  }

  async createSession(userId: User["id"]): Promise<string | null> {
    if (!this.#store) {
      console.warn('⚠️ MongoDB недоступен, возвращаем тестовый sessionId');
      return 'test_session_id';
    }
    
    try {
      const sessionId = nanoid();
      const result = await this.#sessions.insertOne({
        id: sessionId,
        userId: userId,
      });
      return result.acknowledged ? sessionId : null;
    } catch (error) {
      console.warn('⚠️ Ошибка при создании сессии:', (error as Error).message);
      return null;
    }
  }

  getUserByInitData(inputInitData: string): TelegramUser {
    const initData = new URLSearchParams(inputInitData || "");
    const inputUser = initData.get("user") || "null";
    const inputHash = initData.get("hash") || "";
    const token = process.env.TELEGRAM_BOT_API || "";

    // Режим разработки: пропускаем проверку хеша для тестовых данных
    const isDevelopment = process.env.NODE_ENV !== "production";
    const isTestHash = inputHash === "test_hash";
    
    if (isDevelopment && isTestHash) {
      console.warn("🔧 Режим разработки: используются тестовые данные без проверки хеша");
      console.log('🔍 Тестовые данные пользователя:', inputUser);
      try {
        const tgUser = JSON.parse(inputUser);
        console.log('✅ Успешно распарсены тестовые данные:', tgUser);
        return {
          id: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          languageCode: tgUser.language_code,
        };
      } catch (e) {
        console.error('❌ Ошибка парсинга тестовых данных:', e);
        console.error('📄 Тестовые данные для парсинга:', inputUser);
        throw new ValidationError({
          field: "user",
          message: "Invalid user data in test mode",
        });
      }
    }

    // Обычная проверка для продакшена и реальных данных Telegram
    const inputParams: {
      key: string;
      value: string;
    }[] = [];
    initData.forEach((value, key) => {
      if (key === "hash") return;
      inputParams.push({ key, value });
    });

    const sortedInputParams = inputParams.sort((a, b) => {
      return a.key.localeCompare(b.key);
    });

    const dataCheckString = sortedInputParams
      .map(({ key, value }) => `${key}=${value}`)
      .join("\n");

    const secretKey = crypto.createHmac("sha256", "WebAppData").update(token);

    const baseHash = crypto
      .createHmac("sha256", secretKey.digest())
      .update(dataCheckString)
      .digest("hex");

    if (baseHash !== inputHash) {
      throw new ValidationError({
        field: "hash",
        message: "Invalid hash",
      });
    }

    const user = JSON.parse(inputUser);

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      languageCode: user.language_code,
    };
  }

  async #saveUser(user: User): Promise<void> {
    if (!this.#store) {
      console.warn('⚠️ MongoDB недоступен, пропускаем сохранение пользователя');
      return;
    }
    
    try {
      await this.#users.insertOne(user);
    } catch (error) {
      console.warn('⚠️ Ошибка при сохранении пользователя:', (error as Error).message);
    }
  }

  async #editUserById(userId: User["id"], input: Partial<User>): Promise<User | null> {
    if (!this.#store) {
      console.warn('⚠️ MongoDB недоступен, возвращаем null для editUserById');
      return null;
    }
    
    try {
      const result = await this.#users.updateOne(
        { id: userId },
        { $set: input }
      );
      return result.acknowledged ? await this.getUserById(userId) : null;
    } catch (error) {
      console.warn('⚠️ Ошибка при редактировании пользователя:', (error as Error).message);
      return null;
    }
  }

  async #uploadFile(file: Blob): Promise<string> {
    const filename = `${nanoid()}.jpg`;
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    const fileInfo = await this.#objectStorage.uploadFile(filename, fileBuffer);

    return `/image/${(fileInfo as any).Key || filename}`;
  }

  async register(form: FormData, tgUser: TelegramUser): Promise<User> {
    const file = form.get("photo") as Blob;

    // Maybe user already exists?
    const dbUser = await this.getUserById(tgUser.id);
    if (dbUser) {
      return dbUser;
    }

    // TODO: Add the validation of form data
    if (!file) throw new Error("Photo is required!");

    const user = {
      ...tgUser,
      gender: String(form.get("gender")) || "",
      interestsGender: String(form.get("interests")) || "",
      ageRange: String(form.get("age-range")) || "",
      photo: await this.#uploadFile(file),
      restScores: 30,
    };

    await this.#saveUser(user);

    return user;
  }

  async editUser(userId: User["id"], form: FormData) {
    const file = form.get("photo") as Blob;
    const user = await this.getUserById(userId);

    if (!user) {
      throw new Error("User not found!");
    }

    let input = {
      interestsGender: String(form.get("interests")) || user.interestsGender,
      ageRange: String(form.get("age-range")) || user.ageRange,
      photo: user.photo,
    };

    if (file && file.size > 0) {
      input.photo = await this.#uploadFile(file);
    }

    return await this.#editUserById(userId, input);
  }

  async decreaseScores(userId: User["id"]) {
    if (!this.#store) {
      console.warn('⚠️ MongoDB недоступен, пропускаем decreaseScores');
      return false;
    }
    
    try {
      const result = await this.#users.updateOne(
        { id: userId },
        { $inc: { restScores: -1 } }
      );
      return result.acknowledged;
    } catch (error) {
      console.warn('⚠️ Ошибка при уменьшении очков:', (error as Error).message);
      return false;
    }
  }

  async addScores(userId: User["id"], scores: number) {
    if (!this.#store) {
      console.warn('⚠️ MongoDB недоступен, пропускаем addScores');
      return false;
    }
    
    try {
      const result = await this.#users.updateOne(
        { id: userId },
        { $inc: { restScores: scores } }
      );
      return result.acknowledged;
    } catch (error) {
      console.warn('⚠️ Ошибка при добавлении очков:', (error as Error).message);
      return false;
    }
  }
}

export default Auth;
