# v0.4 - Reviewed static hosting candidate (not deployed)

## Purpose and current status

This is a **preparation-only** GitHub Pages candidate for the public Apache-2.0-licensed LionRoute OS Control Plane UI. At this PR, **no Pages site is configured, no hosted demo is live, no deployment has been triggered** and the latest formal public source release remains v0.3.0.

The intended future site is a public GitHub Pages project site under the repository-specific path /lionroute-os/. This is a demo only, using bundled **fictional sample telemetry**. It does not connect to the private LionRoute workspace, control any laptop or CoS application, handle real credentials, execute shell commands, run model providers, or grant operator authority.

## Architecture and trust boundary

- Vite uses base / for local development. Only npm run build:pages explicitly enables the reviewed /lionroute-os/ asset base.
- HTML includes a strict meta Content Security Policy: default-src none, script-src self, connect-src none, object-src none and form-action none. JavaScript, CSS and favicon must resolve under the same repository path.
- The runtime telemetry source is pinned to fictional in-repo data. Source validation rejects browser network calls and browser-side mutation APIs.
- A fail-closed artifact verifier checks CSP, asset integrity, no source maps/environment files/custom domain, no symlinks, and bounded bundle size and file count.
- GitHub Pages is **static-only**. No dynamic backend, authentication, payments, cookies, operator control, repository secrets or API credentials are required or authorized.
- This meta CSP is enforced by supporting browsers. GitHub Pages does not provide arbitrary custom HTTP security headers through this repo; do not claim that frame-ancestors or other HTTP-only headers are enforced.
- Content served as public Pages is visible to everyone. Never expose private project data, identifying logs or user-supplied secrets in future updates.

## Deployment safety model

The proposed .github/workflows/pages-manual.yml is **workflow_dispatch only**. It does NOT deploy on pushes, PRs, merges, release tags or scheduled events. The build job has read-only repository permissions. Only the separate deploy job receives pages:write and id-token:write, after a successful verified build.

A dispatch requires: (1) repository owner, (2) default main branch, (3) explicitly approved 40-character main commit SHA matching the dispatch commit, and (4) an exact manual confirmation phrase. Protect the github-pages deployment environment with a default-branch-only rule and owner approval where available. All external GitHub Actions are pinned to full upstream commit hashes. No cross-repository publishing credentials are added.

Because the site does not yet exist, **merging the workflow is NOT deployment approval**. Actual activation requires a separate explicit owner decision after independent review and GitHub CI.

## Validation commands

    npm ci --ignore-scripts
    npm audit --audit-level=high
    npm run verify:public
    npm run check:source
    npm run typecheck
    npm test
    npm run test:pages
    npm run build:pages
    npm run verify:pages

Existing Python review-only planner tests and Gitleaks run in normal GitHub CI. Linux CI tests symlink denial; Windows accounts without symlink privileges may skip that one fixture test locally.

## Activation checklist (not yet authorized or performed)

1. Obtain independent read-only security review of exact source, static bundle, and manual deployment workflow; resolve blockers.
2. Merge a passing, reviewed public PR; verify post-merge GitHub CI and exact main commit.
3. Obtain explicit owner approval for external Pages activation and that exact source commit.
4. In GitHub Settings > Pages select **GitHub Actions** as the build/deployment source. Protect the github-pages environment with a default-branch-only rule and any required-approval controls available.
5. **Only after approval**, manually dispatch the reviewed workflow from main with the approved full commit SHA and exact confirmation phrase; never auto-dispatch.
6. Verify the public URL anonymously, all JS/CSS/favicon under /lionroute-os/, synthetic UI, CSP-denied API requests, mobile navigation, and no remote requests.
7. Publish the verified URL to README/release history only after smoke checks pass. On disclosure or access failure, disable hosting through an owner-controlled process.

## Limits

GitHub Pages has host quotas and account restrictions. A public static site does not provide app authentication. Meta CSP cannot replace all server-level HTTP headers. Browser checks are not complete accessibility, vulnerability, provenance or production certification.

No custom domain, cloud payment account, GitHub secret, analytics, tracking, provider connection, automatic deploy trigger, npm publication, or private-to-public mirror is part of this candidate.
