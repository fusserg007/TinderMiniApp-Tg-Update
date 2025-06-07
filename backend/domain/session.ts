import type { User } from "./user.js";

export interface Session {
  id: string;
  userId: User["id"];
}
