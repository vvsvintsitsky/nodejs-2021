import csvtojsonV2 from "csvtojson/v2";

import fs from "fs";
import path from "path";

const { writeMockCsvFile } = require("./util");

const csvFilePath = path.join(__dirname, "csv", "mock.csv");
const outputFilePath = path.join(__dirname, "temp", "result.txt");

Promise.all([
  fs.promises.mkdir(path.dirname(csvFilePath), { recursive: true }),
  fs.promises.mkdir(path.dirname(outputFilePath), { recursive: true }),
])
  .then(() => writeMockCsvFile(csvFilePath, 100))
  .then(
    () =>
      new Promise((resolve, reject) =>
        fs
          .createReadStream(csvFilePath)
          .on("error", reject)
          .pipe(csvtojsonV2())
          .pipe(fs.createWriteStream(outputFilePath))
          .on("finish", resolve)
          .on("error", reject)
      )
  )
  .catch((error) => {
    fs.promises.rmdir(outputFilePath);
    console.log(error);
  });
