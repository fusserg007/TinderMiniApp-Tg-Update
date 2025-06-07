import { config } from "dotenv";
import { ExpressHttpServer } from "./infra/express-http-server.js";
import { DI } from "./infra/di.js";
import { MongoStore } from "./infra/mongo-store.js";

// Load environment variables from .env file
const result = config();
console.log("Loaded .env file:", result);
console.log("Environment variables:", {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BACKEND_URL: process.env.BACKEND_URL,
});

DI.setMany({
  store: new MongoStore(),
});

const port = Number(process.env.PORT) || 3000;
const server = new ExpressHttpServer();

server.listen(port, () => {
  console.log(`Backend is running on port ${port}!`);
});
