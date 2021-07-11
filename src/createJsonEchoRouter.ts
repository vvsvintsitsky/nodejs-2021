import { Router } from "express";

import { Context } from "./context/Context";

export function createJsonEchoRouter(
  { requestLogger }: Context
): Router {
  const router = Router();

  router.post("/echo", async (req, res) => {
    requestLogger.info("echo", req, req.body);
    res.json(req.body);
  });

  return router;
}
