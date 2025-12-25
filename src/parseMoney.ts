import { RegexPipeline } from "./regexPipeline";

const defaultPipeline = RegexPipeline.default();

export function parseMoney(text: string) {
  return defaultPipeline.run(text);
}
