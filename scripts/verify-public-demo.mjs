import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const excluded = new Set([".git", "node_modules", "dist", "coverage", "__pycache__"]);
const blockedExtensions = new Set([".pem", ".p12", ".pfx", ".key", ".sqlite", ".db"]);
const findings = [];
let inspected = 0;

// The GitHub owner handle is intentionally excluded from public source, but
// approved public docs can link to the already-public repository and Pages.
// Permit ONLY exact independently verified public URLs in these four docs.
// All other owner-name occurrences and private-name markers remain forbidden.
const publicOwner = "saad" + "spence-bit";
const publicRepo = "https://github.com/" + publicOwner + "/lionroute-os";
const reviewedDocPaths = new Set([
  "README.md", "CHANGELOG.md", "ROADMAP.md", "docs/STATIC_HOSTING_V0.4.md",
]);
const reviewedPublicLinks = [
  "https://" + publicOwner + ".github.io/lionroute-os/",
  publicRepo + "/pull/8",
  publicRepo + "/commit/5e4a06ba2848449be9a716aaf748b149abb44312",
  publicRepo + "/actions/runs/40053822500",
  publicRepo + "/actions/runs/40054294574",
];
function redactReviewedPublicLinks(content, relative) {
  if (!reviewedDocPaths.has(relative)) return content;
  let redacted = content;
  for (const url of reviewedPublicLinks) {
    let cursor = 0;
    while (true) {
      const at = redacted.indexOf(url, cursor);
      if (at === -1) break;
      // Only a complete Markdown link target is eligible: [label](EXACT_URL).
      // URL whitespace, newlines, NBSP, suffixes and query strings must fail.
      // Browsers can normalize some whitespace into extra unreviewed URL paths.
      const beginsAtLinkBoundary = redacted.slice(at - 2, at) === "](";
      const endsAtLinkBoundary = redacted[at + url.length] === ")";
      if (!beginsAtLinkBoundary || !endsAtLinkBoundary) {
        cursor = at + url.length;
        continue;
      }
      redacted = redacted.slice(0, at) + "[REVIEWED_PUBLIC_LINK]" + redacted.slice(at + url.length);
      cursor = at + "[REVIEWED_PUBLIC_LINK]".length;
    }
  }
  return redacted;
}

function visit(current) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const target = path.join(current, entry.name);
    const relative = path.relative(root, target).split(path.sep).join("/");
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) {
      findings.push(relative + ": symlinks are forbidden in a public export");
      continue;
    }
    if (stat.isDirectory()) {
      visit(target);
      continue;
    }
    if (!stat.isFile()) {
      findings.push(relative + ": unexpected file type");
      continue;
    }
    if (relative.endsWith(".tsbuildinfo")) continue;
    if (blockedExtensions.has(path.extname(entry.name).toLowerCase())) {
      findings.push(relative + ": excluded file extension");
      continue;
    }
    if (stat.size > 1024 * 1024) {
      findings.push(relative + ": unexpectedly large file");
      continue;
    }
    const content = fs.readFileSync(target, "utf8");
    const nameCheckedContent = redactReviewedPublicLinks(content, relative);
    inspected++;
    const forbiddenNames = [
      "Market" + " AI App", "Credit" + " Repair App",
      "Mission" + " C", "LR_UPB_" + "PHASE_F",
      "Saad" + "S", "saad" + "spence-bit",
    ];
    for (const name of forbiddenNames) {
      if (nameCheckedContent.toLowerCase().includes(name.toLowerCase())) findings.push(relative + ": private-name marker");
    }
    const markers = [
      new RegExp("-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----"),
      new RegExp("gh" + "[pousr]_" + "[A-Za-z0-9]{20,}"),
      new RegExp("github" + "_pat_" + "[A-Za-z0-9_]{20,}"),
      new RegExp("sk-" + "(?:proj-|ant-)" + "[A-Za-z0-9-]{16,}"),
      new RegExp("[A-Za-z]:" + "\\\\" + "Users" + "\\\\", "i"),
    ];
    if (markers.some((regex) => regex.test(content))) findings.push(relative + ": possible sensitive literal");
  }
}

visit(root);
const source = fs.readFileSync(path.join(root, "src/data/source.ts"), "utf8");
const resolver = source.match(/export function resolveRuntimeTelemetrySource\([\s\S]*?\n\}/)?.[0] ?? "";
if (!resolver.includes("return mockTelemetrySource;") || resolver.includes("createGatewayTelemetrySource(")) {
  findings.push("src/data/source.ts: public runtime must be mock-only");
}
const fixture = fs.readFileSync(path.join(root, "src/data/mockTelemetry.ts"), "utf8");
if (!fixture.includes("Synthetic public portfolio telemetry")) {
  findings.push("src/data/mockTelemetry.ts: synthetic provenance label missing");
}
if (findings.length) {
  console.error("PUBLIC_DEMO_PREFLIGHT=FAIL");
  for (const issue of findings) console.error(issue);
  process.exitCode = 1;
} else {
  console.log("PUBLIC_DEMO_PREFLIGHT=PASS");
  console.log("INSPECTED_FILES=" + inspected);
  console.log("RUNTIME_SOURCE=MOCK_ONLY");
  console.log("NOTE=regex preflight, not a complete independent secret audit");
}
