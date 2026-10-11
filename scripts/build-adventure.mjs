import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

await build({
  entryPoints: [path.join(root, "src", "adventure.js")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  sourcemap: true,
  outfile: path.join(root, "public", "adventure.bundle.js"),
  logLevel: "info",
});
