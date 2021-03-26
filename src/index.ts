import express from "express";

import { InMemoryUserStorage } from "./storage/InMemoryUserStorage";
import { UserService } from "./service/UserService";
import { createUserRouter } from "./router/createUserRouter";

import { PORT } from "./config";

const server = express();

server.use(express.json());

server.use(
  "/users",
  createUserRouter(new UserService(new InMemoryUserStorage()))
);

server.listen(PORT, () => console.log("online"));
