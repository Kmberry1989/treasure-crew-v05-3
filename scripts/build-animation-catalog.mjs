import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const legacySourceDir = path.join(root, "public", "assets", "thumbnails", "animations");
const runtimeDir = path.join(root, "public", "assets", "animations");
const catalogPath = path.join(runtimeDir, "animation-catalog.json");

const CLIP_GROUPS = [
  {
    group: "social-reward-cockpit",
    names: ["Standing Greeting", "Silly Dancing", "Sitting", "Sitting Clap", "Sitting Laughing"],
  },
  {
    group: "traversal-interstitial",
    names: ["Walking", "Jogging", "Joyful Jump", "Falling", "Jumping Down", "Climbing Ladder"],
  },
  {
    group: "puzzle-interaction",
    names: ["Button Pushing", "Opening", "Pick Fruit", "Dig And Plant Seeds"],
  },
  {
    group: "pirate-danger",
    names: ["Stable Sword Inward Slash", "Surprised", "Hanging Idle"],
  },
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function groupForFile(name) {
  const match = CLIP_GROUPS.find((entry) => entry.names.includes(name));
  return match?.group || "unclassified";
}

async function main() {
  await fs.mkdir(runtimeDir, { recursive: true });
  const entries = await fs.readdir(legacySourceDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".fbx"))
    .map((entry) => entry.name)
    .sort();

  const clips = files.map((filename) => {
    const sourceName = filename.replace(/\.fbx$/i, "");
    const id = slugify(sourceName);
    return {
      id,
      name: sourceName,
      sourcePath: `assets/thumbnails/animations/${filename}`,
      runtimePath: `assets/animations/runtime/${id}.glb`,
      group: groupForFile(sourceName),
      status: "source-only",
    };
  });

  const catalog = {
    version: 1,
    sourceRoot: "assets/thumbnails/animations",
    runtimeRoot: "assets/animations/runtime",
    generatedAt: new Date().toISOString(),
    notes: "FBX files are treated as authoring assets. Convert and retarget them to animation-ready GLB clips for runtime use.",
    clips,
  };

  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2));
}

await main();
