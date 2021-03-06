const { ReverseTransform } = require("./ReverseTransform");

process.stdin.pipe(new ReverseTransform()).pipe(process.stdout);
