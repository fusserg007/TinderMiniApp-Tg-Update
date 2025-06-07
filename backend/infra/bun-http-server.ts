import { Serve } from "bun";
import cookie from "cookie";
import Auth from "../app/auth.js";
import { ValidationError } from "../app/errors/validation-error.js";
import { ServiceError } from "../app/errors/service-error.js";
import { restApiRoutes } from "../adapter/rest-api/index.js";
import { HttpRequest } from "../adapter/rest-api/entities/http-request.js";
import TgBotApi from "./tg-bot-api.js";

import type { HttpRoute } from "../adapter/rest-api/entities/http-route.js";
import type { HttpResponse } from "../adapter/rest-api/entities/http-response.js";
import type { HttpServer } from "./entities/http-server.js";

export class BunHttpServer implements HttpServer {
  #auth: Auth;
  #botApi: TgBotApi;

  constructor() {
    this.#auth = new Auth();
    this.#botApi = new TgBotApi();
  }

  #createJSONResponse(params: { status: number; body: any }) {
    return new Response(JSON.stringify(params.body), {
      status: params.status,
      headers: {
        "Content-Type": "application/json; utf-8",
      },
    });
  }

  #createRequestHandler(route: HttpRoute) {
    const requestHandler = async (req: Request) => {
      const userAgent = req.headers.get("user-agent") || "";
      const ip = String(req.headers.get("x-forwarded-for"));

      // Try to find user by sessionId in cookies
      const cookies = cookie.parse(req.headers.get("Cookie") || "");
      const sessionId = cookies[this.#auth.cookieName];
      const user: any = await this.#auth.getUserFromSession(sessionId);

      // Read the body of request
      let body = null;
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = req.body ? await Bun.readableStreamToJSON(req.body) : null;
      }
      if (contentType.includes("multipart/form-data")) {
        body = await req.formData();
      }

      const request = new HttpRequest({
        query: new URL(req.url).searchParams as any,
        body: body,
        userAgent: userAgent,
        ip: ip,
      });

      const headers = new Headers();
      const response: HttpResponse = {
        setCookie: (name, value, params) => {
          headers.set(
            "Set-Cookie",
            cookie.serialize(name, value, {
              path: "/",
              secure: true,
              httpOnly: true,
              ...params,
            })
          );
        },
      };

      // Run the before middlewares
      await Promise.all(
        (route.before || []).map((middleware) => middleware({ request, user }))
      );

      const result = await route.handler({ request, response, user });

      if (typeof result === "string") {
        headers.set("Content-Type", "text/plain");

        return new Response(result, { status: 200, headers });
      }

      headers.set("Content-Type", "application/json; utf-8");

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: headers,
      });
    };

    return requestHandler;
  }

  async listen(port: number, callback?: () => void): Promise<void> {
    const self = this;

    await this.#botApi.setWebhook();

    Bun.serve({
      port: port,

      async fetch(req) {
        const url = new URL(req.url);

        // Handle all REST API routes
        const route = restApiRoutes.find((route) => {
          if (req.method !== route.method) return false;
          if (url.pathname !== route.path) return false;

          return true;
        });

        if (!route) {
          return new Response("Not found!", { status: 404 });
        }

        return self.#createRequestHandler(route)(req);
      },

      error: (error) => {
        // It is validation error
        if (error instanceof ValidationError) {
          return self.#createJSONResponse({
            status: 500,
            body: {
              ok: false,
              error: error.toObject(),
            },
          });
        }

        // It's known error, send as response
        if (error instanceof ServiceError) {
          return self.#createJSONResponse({
            status: 500,
            body: { ok: false, error: { message: error.message } },
          });
        }

        // It's unknown error, log full error and send as dump info as response
        console.error(error);
        return self.#createJSONResponse({
          status: 500,
          body: { ok: false, error: { message: "Unknown error" } },
        });
      },
    });

    if (callback) callback();
  }
}
