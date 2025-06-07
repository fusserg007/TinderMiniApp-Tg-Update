interface HttpRequestInput {
  query: any;
  body: any;
  userAgent: string;
  ip: string;
}

export class HttpRequest {
  #query: HttpRequestInput["query"];
  #body: HttpRequestInput["body"] = null;
  #userAgent: HttpRequestInput["userAgent"] = "";
  #ip: HttpRequestInput["ip"] = "";

  constructor(input: HttpRequestInput) {
    this.#query = input.query;
    this.#body = input.body;
    this.#userAgent = input.userAgent;
    this.#ip = input.ip;
  }

  get query() {
    return this.#query;
  }

  get body() {
    return this.#body;
  }

  get userAgent() {
    return this.#userAgent;
  }

  get ip() {
    return this.#ip;
  }
}
