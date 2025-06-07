import { ServiceError } from "./service-error.js";

export class AccessDeniedError extends ServiceError {
  constructor() {
    super("Access denied!");
    this.name = "AccessDeniedError";
  }
}
