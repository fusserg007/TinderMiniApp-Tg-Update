import { ServiceError } from "./service-error";

export class AccessDeniedError extends ServiceError {
  constructor() {
    super("Access denied!");
    this.name = "AccessDeniedError";
  }
}
