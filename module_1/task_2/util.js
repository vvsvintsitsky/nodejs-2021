const fs = require("fs");
const path = require("path");

const writeLinesToStream = ({ stream, getLine, numberOfLines, callback }) => {
  for (let i = numberOfLines; i > 0; i--) {
    const line = getLine(i);
    const ok = stream.write(line, (error) => {
      if (error) {
        onError(error);
      }
    });
    if (!ok) {
      stream.once("drain", () => write(stream, getLine, i));
      return;
    }
  }

  stream.end(callback);
};

const createLine = (index) => `chert${index},${index}\n`;

const writeMockCsvFile = (filePath, numberOfLines) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    stream.on("error", reject);
    stream.write("name,points\n");

    writeLinesToStream({
      stream,
      getLine: createLine,
      numberOfLines,
      callback: resolve,
    });
  });
};

module.exports = { writeMockCsvFile };
