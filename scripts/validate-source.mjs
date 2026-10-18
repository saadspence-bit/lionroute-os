import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(projectRoot, "src");
const failures = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function relative(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join("/");
}

for (const jsonFile of ["package.json", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json"]) {
  try {
    JSON.parse(fs.readFileSync(path.join(projectRoot, jsonFile), "utf8"));
  } catch (error) {
    failures.push(`${jsonFile}: invalid JSON (${error.message})`);
  }
}

const sourceFiles = walk(sourceRoot).filter((filePath) => /\.(ts|tsx)$/.test(filePath));
const forbiddenRuntimePatterns = [
  ["websocket", /\bWebSocket\b/],
  ["filesystem API", /(?:node:fs|from\s+["']fs["'])/],
  ["child process API", /(?:node:child_process|child_process)/],
  ["Windows drive literal", /[A-Za-z]:\\(?:[^\s"']+)/],
  ["LOCALAPPDATA dependency", /\bLOCALAPPDATA\b/],
];
const networkPatterns = [
  ["fetch call", /\bfetch\s*\(/],
  ["global fetch", /\b(?:window|globalThis)\.fetch\b/],
  ["EventSource", /\bEventSource\b/],
  ["XMLHttpRequest", /\bXMLHttpRequest\b/],
  ["sendBeacon", /\bsendBeacon\b/],
  ["WebSocket", /\bWebSocket\b/],
  ["dynamic remote import", /\bimport\s*\(\s*["']https?:/],
  ["external Google Fonts", /fonts\.(?:googleapis|gstatic)\.com/],
];
function networkIssuesForSource(source, displayPath) {
  if (displayPath.endsWith(".test.ts") || displayPath.endsWith(".test.tsx")) return [];
  return networkPatterns.filter(([, pattern]) => pattern.test(source))
    .map(([label]) => label + " forbidden in synthetic-only portfolio browser logic");
}
const networkGuardFixtures = [
  ["fetch", "fetch('/api/test')"],
  ["EventSource", "new EventSource('/api/events')"],
  ["global fetch", "globalThis.fetch('/api')"],
  ["sendBeacon", "navigator.sendBeacon('/api', 'value')"],
  ["font import", "https://fonts.googleapis.com/css2?family=Inter"],
];
for (const [label, source] of networkGuardFixtures) {
  if (!networkIssuesForSource(source, "src/fixture.ts").length) {
    failures.push("synthetic-only guard self-test failed to reject: " + label);
  }
}
const runtimeSource = fs.readFileSync(path.join(projectRoot, "src/data/source.ts"), "utf8");
const resolver = runtimeSource.match(/export function resolveRuntimeTelemetrySource\([\s\S]*?\n\}/)?.[0] ?? "";
if (!runtimeSource.includes("export function useTelemetry()") ||
    !runtimeSource.includes("const source = runtimeTelemetrySource;")) {
  failures.push("public useTelemetry must not accept injectable runtime transport");
}
const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
if (!html.includes("Content-Security-Policy") ||
    !html.includes("connect-src &#39;none&#39;") ||
    !html.includes("script-src &#39;self&#39;")) {
  failures.push("public HTML must prohibit live network connections via Content Security Policy");
}
if (!resolver.includes("return mockTelemetrySource;") || resolver.includes("createGatewayTelemetrySource(")) {
  failures.push("public runtime must always resolve mock telemetry");
}
if (/\bcreateGatewayTelemetrySource\b|\bsubscribeGatewayInvalidations\b/.test(runtimeSource)) {
  failures.push("private network transport must not ship in public runtime module");
}

// Guard HTML/CSS templates too: browser source policy applies to every
// resource included in the public build, not only TypeScript import graphs.
const assetPaths = [
  path.join(projectRoot, "index.html"),
  ...walk(sourceRoot).filter((p) => /\.css$/i.test(p)),
  ...walk(path.join(projectRoot, "public")).filter((p) => /\.(?:svg|html|css)$/i.test(p)),
];
const forbiddenRemoteReferences = [
  /<script\b[^>]*\bsrc\s*=\s*["']https?:\/\//i,
  /<link\b[^>]*\bhref\s*=\s*["']https?:\/\//i,
  /@import\s+(?:url\()?\s*["']?https?:\/\//i,
  /url\s*\(\s*["']?https?:\/\//i,
  /fonts\.(?:googleapis|gstatic)\.com/i,
];
function remoteAssetIssues(content) {
  return forbiddenRemoteReferences.some((pattern) => pattern.test(content));
}
if (!remoteAssetIssues('<script src="https://example.invalid/payload.js"></script>') ||
    !remoteAssetIssues('@import "https://fonts.googleapis.com/css2?family=Test";')) {
  failures.push("external HTML/CSS network guard self-test failed");
}
for (const filePath of assetPaths) {
  const body = fs.readFileSync(filePath, "utf8");
  if (remoteAssetIssues(body)) failures.push(relative(filePath) + ": remote HTML/CSS asset forbidden in synthetic demo");
}

for (const filePath of sourceFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const displayPath = relative(filePath);

  for (const match of source.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
    const specifier = match[1];
    const basePath = path.resolve(path.dirname(filePath), specifier);
    const candidates = [
      basePath,
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      `${basePath}.jsx`,
      path.join(basePath, "index.ts"),
      path.join(basePath, "index.tsx"),
    ];
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      failures.push(`${displayPath}: unresolved relative import ${specifier}`);
    }
  }

  for (const [label, pattern] of forbiddenRuntimePatterns) {
    if (pattern.test(source)) {
      failures.push(`${displayPath}: ${label} detected in browser application logic`);
    }
  }

  for (const issue of networkIssuesForSource(source, displayPath, filePath)) failures.push(`${displayPath}: ${issue}`);

  if (/method\s*:\s*["'](?:POST|PUT|PATCH|DELETE)["']/i.test(source)) {
    failures.push(`${displayPath}: mutating HTTP method detected in observer-only browser logic`);
  }
}

if (failures.length > 0) {
  console.error("SOURCE_CHECK=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SOURCE_CHECK=PASS");
console.log(`TS_SOURCE_FILES=${sourceFiles.length}`);
console.log("RELATIVE_IMPORTS=RESOLVED");
console.log("BROWSER_OS_ASSUMPTIONS=NONE_DETECTED");
console.log("NETWORK_BOUNDARY=NO_BROWSER_NETWORK_CALLS");
console.log("MUTATING_ACTION_APIS=NONE_DETECTED");
console.log("NETWORK_GUARD_SELF_TESTS=PASS");
