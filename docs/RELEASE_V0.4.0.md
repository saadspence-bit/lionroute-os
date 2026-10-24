# LionRoute OS Public Control Plane - v0.4.0

Release date: **October 24, 2026 (UTC)**

**Scope:** formal open-source source-code release documenting the independently reviewed, publicly accessible **synthetic-only static demo**. This is not the private LionRoute OS runtime, an operational AI agent, a remote-control gateway, or production telemetry.

## New in v0.4.0

- Manual-only GitHub Pages workflow with repository-path Vite build at /lionroute-os/, pinned workflow actions, and owner, branch, approved-commit-SHA, and confirmation gates.
- Deterministic static bundle inventory and checks: local JS/CSS/favicon, meta CSP, no symlinks, dotfiles, source maps, custom domains or hidden Pages marker, plus file and byte caps.
- Dedicated Pages denial tests and GitHub CI checks for the static bundle, while preserving source disclosure guards and read-only fictional data.
- Live public Control Plane accessible from the verified URL in the README. Its five-stop Guided Demo remains bundled with fictional projects, records, operations, traces and evidence.
- Public documentation of the exact deployment review, test results, owner authorization, postdeployment browser smoke, limitations, and manual future-update policy.
- A narrow disclosure-preflight exception for **exact approved Markdown links** to already-public Pages/repository evidence, preserving rejection of unapproved suffixes, destinations and private-name markers.

## Reviewed source and hosting provenance

- Hosting feature PR **#8**: independently reviewed, merged public source commit **5e4a06ba2848449be9a716aaf748b149abb44312**.
- Public postmerge CI **40053822500**: SUCCESS on that exact hosting-source commit.
- Owner-authorized GitHub Pages workflow **40054294574**: both build/verification and deploy jobs SUCCESS against the same commit on October 24, 2026 UTC.
- Documentation/security-preflight PR **#9**: independently reviewed and merged as public main commit **1a393e13a76c01ea813776af813e8e942ddb9b0d**. Subsequent main CI **40055849176**: SUCCESS. The documentation update did not trigger another Pages deployment.
- The Pages source uses GitHub Actions; HTTPS enforcement was verified, no custom domain was configured, and the github-pages deployment environment accepted main only.
- Anonymous HTTPS served **HTTP 200**; desktop UI and Guided Demo rendered, and a 390px headless Chrome check showed no horizontal overflow, five tour stops, fictional disclosure, and the meta CSP blocking an attempted test API fetch. No external requests were observed in that isolated mobile test.
- These are bounded smoke and validation results, **not** a comprehensive accessibility, security, privacy or production certification.

## Static public/private separation

The public app reads **bundled fictional telemetry only**. It does not call a private gateway, execute shell commands, access real CoS conversations, control the user's laptop, use paid or free AI providers, expose operator approvals, or synchronize private source automatically. Demo navigation and controls change presentation only.

The published site remains **manual-deployment only**. Merging this release metadata, creating the v0.4.0 tag, or publishing its GitHub Release **does not redeploy the already hosted Pages artifact**. A future site update requires a new independently reviewed source SHA, owner approval, manual workflow dispatch and anonymous verification.

## Reproduce checks from tagged source

Use Node.js 24+ and npm 11+.

    npm ci --ignore-scripts
    npm audit --audit-level=high
    npm run verify:public
    npm run check:source
    npm run typecheck
    npm test
    npm run test:pages
    npm run build:pages
    npm run verify:pages

General CI also runs pinned Gitleaks scanning and the Python update-planner tests. The Linux workflow executes the symlink-denial fixture; an unprivileged Windows account may skip that fixture locally.

## Known limits and next work

- The public demonstration is a static website and **cannot** operate the private LionRoute environment.
- CSP is supplied by an HTML meta tag; HTTP-header-only directives are not established.
- No live providers, backend access, credentials, commands, payments, private-to-public mirroring, automatic Pages dispatch or new cloud service are part of this release.
- Future mobile control of the private system requires a **separately authenticated private UI/gateway**, security review, and user-authorized activation; it must never be exposed through this public Pages site.

The separate private workspace, its Git history and its privileged operations are **not included in this Apache-2.0 public source release**.
