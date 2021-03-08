import { ReverseTransform } from "./ReverseTransform";

process.stdin.pipe(new ReverseTransform()).pipe(process.stdout);
