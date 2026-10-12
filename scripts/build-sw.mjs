import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const root = path.resolve("dist");
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(path.join(directory, entry.name))
          : [path.join(directory, entry.name)],
      ),
    )
  ).flat();
}
const paths = (await files(root))
  .filter((file) => !file.endsWith("sw.js"))
  .sort();
const hash = createHash("sha256");
for (const file of paths) hash.update(await readFile(file));
const assets = paths.map(
  (file) => "/" + path.relative(root, file).split(path.sep).join("/"),
);
let source = await readFile("public/sw.js", "utf8");
source = source
  .replace("const ASSETS = [];", `const ASSETS = ${JSON.stringify(assets)};`)
  .replace(
    "dentus-static-dev",
    `dentus-static-${hash.digest("hex").slice(0, 12)}`,
  );
await writeFile(path.join(root, "sw.js"), source);
console.log(`PWA: ${assets.length} recursos estáticos; API não armazenada.`);
