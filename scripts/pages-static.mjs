import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PAGES_BASE = "/lionroute-os/";
const MAX_FILES = 180;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;

function fileInventory(directory) {
  const entries = [];
  let size = 0;
  function visit(folder) {
    for (const child of readdirSync(folder, { withFileTypes: true })) {
      const absolute = path.join(folder, child.name);
      const relative = path.relative(directory, absolute).replaceAll(path.sep, "/");
      const stat = lstatSync(absolute);
      assert(!stat.isSymbolicLink(), "Pages bundle cannot contain symlinks: " + relative);
      if (stat.isDirectory()) {
        visit(absolute);
      } else {
        assert(stat.isFile(), "Pages bundle cannot contain special files: " + relative);
        assert(!/(^|\/)(?:\.git|node_modules|__pycache__)(\/|$)/i.test(relative), "Forbidden Pages path: " + relative);
        assert(!/(?:^|\/)(?:\.env(?:\..*)?|CNAME|\.nojekyll\.bak)$|\.(?:map|pem|pfx|key|db|sqlite|pyc)$/i.test(relative), "Forbidden Pages file: " + relative);
        assert(["index.html", "favicon.svg", ".nojekyll"].includes(relative)
          || /^assets\/[a-zA-Z0-9_-]+\.(?:js|css)$/.test(relative), "Unreviewed Pages file type: " + relative);
        size += stat.size;
        entries.push(relative);
      }
      assert(entries.length <= MAX_FILES && size <= MAX_TOTAL_BYTES, "Pages artifact exceeds reviewed size limits");
    }
  }
  visit(directory);
  return entries.sort();
}

export function verifyPagesDirectory(directory) {
  assert(existsSync(directory) && lstatSync(directory).isDirectory(), "Pages dist directory missing");
  const names = fileInventory(directory);
  assert(names.includes("index.html"), "Missing index.html");
  assert(names.includes("favicon.svg"), "Missing local favicon");
  assert(names.includes(".nojekyll"), "Missing GitHub Pages nojekyll marker");
  assert(!names.includes("CNAME"), "Custom domain is not authorized");
  const raw = readFileSync(path.join(directory, "index.html"), "utf8");
  const normalized = raw.replaceAll("&#39;", "'").replaceAll("&apos;", "'");
  assert(normalized.includes('id="root"'), "Missing application root");
  const cspTag = normalized.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
  assert(cspTag, "Missing static CSP");
  const csp = cspTag[1];
  for (const directive of ["default-src 'none'", "script-src 'self'", "connect-src 'none'", "object-src 'none'", "form-action 'none'"]) {
    assert(csp.includes(directive), "CSP protection absent: " + directive);
  }
  assert(!/\b(?:http|https):\/\//i.test(csp), "External CSP origin unexpected");
  const localRefs = [...raw.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  assert(localRefs.length >= 3, "Expected locally bundled script, CSS and favicon references");
  for (const href of localRefs) {
    assert(href.startsWith(PAGES_BASE), "Unscoped/external hosting asset: " + href);
    assert(!href.includes("..") && !href.includes("?") && !href.includes("#"), "Suspicious asset URL: " + href);
    const relative = href.slice(PAGES_BASE.length);
    assert(names.includes(relative), "Referenced artifact missing: " + href);
  }
  assert(localRefs.some((ref) => /\/assets\/.*\.js$/.test(ref)), "Missing bundled JS");
  assert(localRefs.some((ref) => /\/assets\/.*\.css$/.test(ref)), "Missing bundled CSS");
  assert(localRefs.includes(PAGES_BASE + "favicon.svg"), "Favicon still uses root path");
  return { files: names.length, bytes: names.reduce((n, rel) => n + lstatSync(path.join(directory, rel)).size, 0), base: PAGES_BASE };
}

export function buildPages(root) {
  assert(existsSync(path.join(root, "package-lock.json")), "Package lock missing");
  const childEnv = { ...process.env, LIONROUTE_PAGES_BUILD: "1" };
  const commands = [
    path.join(root, "node_modules/typescript/bin/tsc"),
    path.join(root, "node_modules/vite/bin/vite.js"),
  ];
  for (let i = 0; i < commands.length; i += 1) {
    execFileSync(process.execPath, i === 0 ? [commands[i], "-b", "--pretty", "false"] : [commands[i], "build"], {
      cwd: root, env: childEnv, stdio: "inherit", windowsHide: true,
    });
  }
  const dist = path.join(root, "dist");
  writeFileSync(path.join(dist, ".nojekyll"), "", { flag: "w" });
  return verifyPagesDirectory(dist);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const action = process.argv[2];
  if (!["build", "verify"].includes(action)) throw new Error("Only build or verify is authorized");
  const result = action === "build" ? buildPages(root) : verifyPagesDirectory(path.join(root, "dist"));
  console.log("PAGES_STATIC_BUNDLE=PASS", result);
}
