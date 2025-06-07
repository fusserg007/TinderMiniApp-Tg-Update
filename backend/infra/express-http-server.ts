import express from 'express';
import cookie from "cookie";
import cors from "cors";

import Auth from "../app/auth.js";
import { ValidationError } from "../app/errors/validation-error.js";
import { ServiceError } from "../app/errors/service-error.js";
import { restApiRoutes } from "../adapter/rest-api/index.js";
import { HttpRequest } from "../adapter/rest-api/entities/http-request.js";
import TgBotApi from "./tg-bot-api.js";

import type { HttpRoute } from "../adapter/rest-api/entities/http-route.js";
import type { HttpResponse } from "../adapter/rest-api/entities/http-response.js";
import type { HttpServer } from "./entities/http-server.js";
import type { Request, Response } from 'express';

export class ExpressHttpServer implements HttpServer {
  private auth: Auth;
  private botApi: TgBotApi;
  private app: express.Application;

  constructor() {
    this.auth = new Auth();
    this.botApi = new TgBotApi();
    this.app = express();
    
    // Enable CORS
    this.app.use(cors());
    
    // Parse JSON bodies
    this.app.use(express.json());
    
    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true }));
  }

  private createRequestHandler(route: HttpRoute) {
    return async (req: Request, res: Response) => {
      try {
        console.log(`Handling ${req.method} request to ${req.path}`);
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        
        const userAgent = req.headers['user-agent'] || '';
        const ip = req.ip;

        // Try to find user by sessionId in cookies
        const cookies = cookie.parse(req.headers.cookie || '');
        const sessionId = cookies[this.auth.cookieName] || '';
        const user: any = await this.auth.getUserFromSession(sessionId);

        const request = new HttpRequest({
          query: req.query,
          body: req.body,
          userAgent: userAgent,
          ip: ip,
        });

        const response: HttpResponse = {
          setCookie: (name, value, params) => {
            res.cookie(name, value, {
              path: '/',
              secure: true,
              httpOnly: true,
              ...params,
            });
          },
        };

        // Run the before middlewares
        await Promise.all(
          (route.before || []).map((middleware) => middleware({ request, user }))
        );

        const result = await route.handler({ request, response, user });

        if (typeof result === 'string') {
          res.setHeader('Content-Type', 'text/plain');
          res.status(200).send(result);
          return;
        }

        res.setHeader('Content-Type', 'application/json; utf-8');
        res.status(200).json(result);
      } catch (error) {
        console.error('Error handling request:', error);
        
        if (error instanceof ValidationError) {
          res.status(500).json({
            ok: false,
            error: error.toObject(),
          });
          return;
        }

        if (error instanceof ServiceError) {
          res.status(500).json({
            ok: false,
            error: { message: error.message },
          });
          return;
        }

        console.error(error);
        res.status(500).json({
          ok: false,
          error: { message: 'Unknown error' },
        });
      }
    };
  }

  async listen(port: number, callback?: () => void): Promise<void> {
    await this.botApi.setWebhook();

    // Register all REST API routes
    restApiRoutes.forEach((route) => {
      const method = route.method.toLowerCase() as keyof express.Application;
      if (typeof this.app[method] === 'function') {
        console.log(`Registering route: ${route.method} ${route.path}`);
        (this.app[method] as any)(route.path, this.createRequestHandler(route));
      }
    });

    this.app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
      if (callback) callback();
    });
  }
} 