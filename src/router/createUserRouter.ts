import { Router } from "express";
import { UserService } from "../service/UserService";

export function createUserRouter(userService: UserService) {
  const router = Router();

  router.get("/user/:id", (req, res) => {
    const user = userService.getById(req.params.id);

    if (user) {
      res.json(user);
      return;
    }

    res.sendStatus(404);
  });

  router.delete("/user/:id", (req, res) => {
    userService.markAsDeleted(req.params.id);
    res.sendStatus(200);
  });

  router.put("/user/:id", (req, res) => {
    const { id, ...sanitizedUser } = req.body;
    userService.update(req.params.id, sanitizedUser);
    res.sendStatus(200);
  });

  router.post("/create", (req, res) => {
    userService.create(req.body);
    res.sendStatus(201);
  });

  router.get("/autoSuggest", (req, res) => {
    const loginPart = req.query.loginPart ?? "";
    const limit = Number(req.query.limit) || 10;

    if (typeof loginPart !== "string" || typeof limit !== "number") {
      res.sendStatus(400);
      return;
    }

    res.json(userService.getAutoSuggestUsers(loginPart, limit));
  });

  return router;
}
