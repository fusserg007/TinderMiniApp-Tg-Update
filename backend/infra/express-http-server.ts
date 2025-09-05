import express from 'express';
import cookie from "cookie";
import cors from "cors";

import Auth from "../app/auth";
import { ValidationError } from "../app/errors/validation-error";
import { ServiceError } from "../app/errors/service-error";
import { restApiRoutes } from "../adapter/rest-api/index";
import { HttpRequest } from "../adapter/rest-api/entities/http-request";
import TgBotApi from "./tg-bot-api";

import type { HttpRoute } from "../adapter/rest-api/entities/http-route";
import type { HttpResponse } from "../adapter/rest-api/entities/http-response";
import type { HttpServer } from "./entities/http-server";
import type { Request, Response } from 'express';

export class ExpressHttpServer implements HttpServer {
  private auth: Auth;
  private botApi: TgBotApi;
  private app: express.Application;

  constructor() {
    this.auth = new Auth();
    this.botApi = new TgBotApi();
    this.app = express();
    
    // Настройка CORS для работы с фронтендом
    this.app.use(cors({
      origin: [
        'http://localhost:5173', // Vite dev server
        'http://localhost:3000', // альтернативный порт
        'https://web.telegram.org', // Telegram Web App
        process.env.FRONTEND_URL || 'http://localhost:5173'
      ],
      credentials: true, // Разрешить отправку cookies
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    
    // Парсинг JSON тел запросов
    this.app.use(express.json({ limit: '10mb' }));
    
    // Парсинг URL-encoded тел запросов
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Логирование запросов в режиме разработки
    if (process.env.NODE_ENV !== 'production') {
      this.app.use((req, res, next) => {
        console.log(`📥 ${req.method} ${req.path}`);
        if (Object.keys(req.body).length > 0) {
          console.log('📦 Body:', req.body);
        }
        next();
      });
    }
  }

  private createRequestHandler(route: HttpRoute) {
    return async (req: Request, res: Response) => {
      try {
        console.log(`Handling ${req.method} request to ${req.path}`);
        
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
          ip: ip || 'unknown',
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

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
      } catch (error) {
        console.error('Error handling request:', error);
        
        // Проверяем, не был ли уже отправлен ответ
        if (res.headersSent) {
          console.error('Headers already sent, cannot send error response');
          return;
        }
        
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