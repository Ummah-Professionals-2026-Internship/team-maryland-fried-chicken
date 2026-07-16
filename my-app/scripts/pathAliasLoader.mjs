import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolvePath(__dirname, "..");
const rootURL = pathToFileURL(projectRoot + "/").href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    let mapped = rootURL + specifier.slice(2);
    // Append .js if no file extension present
    if (!/\.[a-z]+$/i.test(mapped.split("?")[0])) {
      mapped += ".js";
    }
    return nextResolve(mapped, context);
  }
  return nextResolve(specifier, context);
}
