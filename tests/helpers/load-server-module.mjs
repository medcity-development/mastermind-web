import { readFile } from "node:fs/promises";
const modules = new Map();
export async function serverModuleUrl(name) {
  if (modules.has(name)) return modules.get(name);
  const promise = (async () => {
    let source = (await readFile(new URL(`../../src/lib/${name}.js`, import.meta.url), "utf8"))
      .replace(/import ["']server-only["'];?/g, "");
    for (const match of [...source.matchAll(/(["'])@\/lib\/([^"']+)\1/g)]) {
      source = source.replaceAll(match[0], JSON.stringify(await serverModuleUrl(match[2])));
    }
    return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  })();
  modules.set(name, promise);
  return promise;
}
export async function loadServerModule(name) { return import(await serverModuleUrl(name)); }
