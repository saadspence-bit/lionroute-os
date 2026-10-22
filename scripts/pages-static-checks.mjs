import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, symlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { verifyPagesDirectory } from "./pages-static.mjs";

const base = "/lionroute-os/";
function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "lionroute-static-check-"));
  mkdirSync(path.join(root, "assets"));
  writeFileSync(path.join(root, "favicon.svg"), "<svg/>");
  writeFileSync(path.join(root, "assets", "app.js"), "console.log('fictional');");
  writeFileSync(path.join(root, "assets", "app.css"), "body{}");
  const html = '<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; script-src &#39;self&#39;; connect-src &#39;none&#39;; object-src &#39;none&#39;; form-action &#39;none&#39;" /><link rel="icon" href="' + base + 'favicon.svg"><link rel="stylesheet" href="' + base + 'assets/app.css"></head><body><div id="root"></div><script src="' + base + 'assets/app.js"></script></body></html>';
  writeFileSync(path.join(root, "index.html"), html);
  return { root, html };
}
function runScenario(mutate, denied = true) {
  const f = fixture();
  try {
    mutate(f);
    if (denied) assert.throws(() => verifyPagesDirectory(f.root));
    else assert.equal(verifyPagesDirectory(f.root).base, base);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
}
test("valid, repo-scoped, CSP-protected static bundle passes", () => runScenario(() => {}, false));
test("root-relative favicon is rejected", () => runScenario(({ root, html }) => writeFileSync(path.join(root, "index.html"), html.replace(base + "favicon.svg", "/favicon.svg"))));
test("remote script is rejected", () => runScenario(({ root, html }) => writeFileSync(path.join(root, "index.html"), html.replace(base + "assets/app.js", "https:" + "//outside.example/script.js"))));
test("missing CSP is rejected", () => runScenario(({ root, html }) => writeFileSync(path.join(root, "index.html"), html.replace("connect-src &#39;none&#39;", "connect-src *"))));
test("missing local asset is rejected", () => runScenario(({ root }) => rmSync(path.join(root, "favicon.svg"))));
test("unreviewed custom domain is rejected", () => runScenario(({ root }) => writeFileSync(path.join(root, "CNAME"), "example.invalid")));
test("environment file is rejected", () => runScenario(({ root }) => writeFileSync(path.join(root, ".env.local"), "sample")));
test("arbitrary unreviewed text is rejected", () => runScenario(({ root }) => writeFileSync(path.join(root, "private-notes.txt"), "example")));
test("source maps are rejected", () => runScenario(({ root }) => writeFileSync(path.join(root, "assets", "app.js.map"), "{}")));
test("symlinks are rejected when OS symlink creation is permitted", (t) => {
  const f = fixture();
  try {
    try { rmSync(path.join(f.root, "assets", "app.js")); symlinkSync(path.join(f.root, "favicon.svg"), path.join(f.root, "assets", "app.js"), "file"); }
    catch (error) {
      if (error.code === "EPERM" && process.platform === "win32") { t.skip("Windows account cannot create symlinks"); return; }
      throw error;
    }
    assert.throws(() => verifyPagesDirectory(f.root));
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
test("too many generated files are rejected", () => runScenario(({ root }) => {
  for (let i = 0; i < 180; i++) writeFileSync(path.join(root, "assets", "extra-" + String(i).padStart(3, "0") + ".js"), "");
}));
test("oversized allowlisted JavaScript asset is rejected by byte cap", () => runScenario(({ root }) => {
  writeFileSync(path.join(root, "assets", "oversized.js"), Buffer.alloc(26 * 1024 * 1024, 0));
}));
test("dotfile marker not present in upload artifact is rejected", () => runScenario(({ root }) => {
  writeFileSync(path.join(root, ".nojekyll"), "");
}));
