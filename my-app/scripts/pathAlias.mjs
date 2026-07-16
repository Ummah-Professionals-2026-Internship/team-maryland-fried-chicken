import { register } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

register(
  pathToFileURL(__dirname + "/pathAliasLoader.mjs").href,
  pathToFileURL(__dirname + "/")
);
