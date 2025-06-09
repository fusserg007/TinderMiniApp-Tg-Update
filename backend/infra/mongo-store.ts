import { MongoClient } from "mongodb";
import { nanoid } from "nanoid";

import type { Collection, Db } from "mongodb";
import type { User } from "../domain/user";
import type { Session } from "../domain/session";

export class MongoStore {
  #client: MongoClient;
  #db: Db;
  #users: Collection<User>;
  #sessions: Collection<Session>;
  #isConnected: boolean = false;

  constructor() {
    const username = process.env.MONGO_INITDB_ROOT_USERNAME;
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
    const database = process.env.MONGODB_DATABASE;
    
    if (!username || !password || !database) {
      throw new Error('MongoDB переменные окружения не настроены');
    }
    
    const uri = `mongodb://${username}:${password}@localhost:27017/${database}?authSource=admin`;
    console.log('MongoDB URI:', uri.replace(password, '***'));

    this.#client = new MongoClient(uri);
    this.#db = this.#client.db(database);
    this.#users = this.#db.collection("users");
    this.#sessions = this.#db.collection("sessions");
  }

  /**
   * Инициализация подключения к MongoDB
   */
  async connect(): Promise<void> {
    try {
      await this.#client.connect();
      await this.#client.db("admin").command({ ping: 1 });
      this.#isConnected = true;
      console.log('✅ Успешное подключение к MongoDB');
    } catch (error) {
      console.error('❌ Ошибка подключения к MongoDB:', error);
      throw error;
    }
  }

  /**
   * Закрытие подключения к MongoDB
   */
  async disconnect(): Promise<void> {
    try {
      await this.#client.close();
      this.#isConnected = false;
      console.log('MongoDB подключение закрыто');
    } catch (error) {
      console.error('Ошибка при закрытии подключения к MongoDB:', error);
    }
  }

  /**
   * Проверка состояния подключения
   */
  get isConnected(): boolean {
    return this.#isConnected;
  }

  get users() {
    return this.#users;
  }

  get sessions() {
    return this.#sessions;
  }
}
