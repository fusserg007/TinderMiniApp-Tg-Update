import { MongoClient } from "mongodb";
import { nanoid } from "nanoid";

import type { Collection, Db } from "mongodb";
import type { User } from "../domain/user.js";
import type { Session } from "../domain/session.js";

export class MongoStore {
  #client: MongoClient;
  #db: Db;
  #users: Collection<User>;
  #sessions: Collection<Session>;

  constructor() {
    const username = process.env.MONGO_INITDB_ROOT_USERNAME;
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
    const database = process.env.MONGODB_DATABASE;
    const uri = `mongodb://${username}:${password}@db:27017/${database}?authSource=admin`;

    this.#client = new MongoClient(uri);
    this.#db = this.#client.db(database);
    this.#users = this.#db.collection("users");
    this.#sessions = this.#db.collection("sessions");
  }

  get users() {
    return this.#users;
  }

  get sessions() {
    return this.#sessions;
  }
}
