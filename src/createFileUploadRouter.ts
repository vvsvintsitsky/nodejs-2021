import * as fs from "fs";
import { join } from "path";

import { Router } from "express";
import { IncomingForm } from "formidable";

import { Context } from "./context/Context";

export function createFileUploadRouter(
  { requestLogger }: Context,
  basePath: string,
  uploadFolderName: string
): Router {
  const router = Router();

  router.post("/upload", async (req, res) => {
    const uploadDir = join(basePath, uploadFolderName);

    await fs.promises.mkdir(uploadDir, { recursive: true });

    new IncomingForm({ uploadDir, keepExtensions: true }).parse(
      req,
      (err, fields, files) => {
        if (files.fileUploaded instanceof Array) {
          return;
        }

        const { size, path, name, type } = files.fileUploaded;

        res.writeHead(200, { "content-type": "text/plain" });
        res.write("success");

        requestLogger.info("received upload", req, { size, path, name, type });

        fs.rename(path, join(uploadFolderName, name ?? ""), () => undefined);

        res.end();
      }
    );
  });

  return router;
}
