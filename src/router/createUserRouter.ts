import { Router } from "express";
import { UserService } from "../service/UserService";
import { createSchemaValidator } from "../validation/createSchemaValidator";
import { createValidationMiddleware } from "../validation/createValidationMiddleware";

const USER_PATTERN = "/user/:id";

const validateUserMiddleware = createValidationMiddleware(
  createSchemaValidator({
    properties: {
      id: { type: "string" },
      login: { type: "string" },
      password: { type: "string" },
      age: { type: "int32" },
      isDeleted: { type: "boolean" },
    },
  })
);

export function createUserRouter(userService: UserService) {
  const router = Router();

  router.get(USER_PATTERN, (req, res) => {
    const user = userService.getById(req.params.id);

    if (user) {
      res.json(user);
      return;
    }

    res.sendStatus(404);
  });

  router.delete(USER_PATTERN, (req, res) => {
    userService.markAsDeleted(req.params.id);
    res.sendStatus(200);
  });

  router.put(USER_PATTERN, (req, res) => {
    userService.update(req.params.id, req.body);
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
