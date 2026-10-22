# LionRoute OS Public Control Plane - v0.3.0

Release date: **October 22, 2026**

The public Control Plane is a real React/TypeScript frontend demonstrating observability concepts with **entirely synthetic example data**. This is an open-source source-code release, **not a hosted service, operational AI agent, or production backend**.

## New in this release

- A five-stop **Guided Demo** for Projects, Operations, History/Replay, Evidence, and System Map.
- Read-only controls that open existing views, preserve the current tour position on return, support direct step selection, and reset on finishing.
- Demonstration counts and sample names derived from the bundled fictional telemetry, including explicit fallbacks for empty datasets.
- A Command Center invitation, primary navigation item, responsive presentation, accessible button labels, and an original synthetic screenshot.
- Seven new deterministic guided-demo tests, bringing the total to **70 frontend tests across 15 test files**, plus six separate public-update planner tests.
- Updated README, roadmap, changelog, and public Guided Demo acceptance notes.

## Review and evidence

- Feature code was reviewed independently and merged through **pull request #6**, merge commit dad35532043cec5fb6e32d81657036aee314553d.
- GitHub Actions run **39854654631** passed on the exact merged public-main commit; it exercises pinned Gitleaks scanning, npm audit, disclosure/source checks, TypeScript, unit tests and Vite build.
- Local headless Chrome exercised starting the walkthrough, selecting a stop, opening Operations, returning to the same stop, skipping to System Map, finishing/resetting, and navigating from mobile.
- No horizontal page overflow was detected at the tested 360, 390, 768, 900, and 1440px browser widths.
- The guided tour's independent read-only review returned **APPROVE** with no blockers. Keyboard focus refinement on some screen transitions and one minor text separator were identified as nonblocking future polish.

## Run locally

Node.js 24+ and npm 11+ are recommended. From this public source repository:

    npm ci
    npm run verify:public
    npm run check:source
    npm run typecheck
    npm test
    npm run build
    npm run dev

The demo remains **hard-locked to bundled fictional telemetry**. Its Content Security Policy blocks application network connections. Nothing in this release can access the private LionRoute workspace, call paid or free model providers, handle credentials, execute commands, or authorize live actions.

## Limitations and next milestone

- There is no hosted public demo, production telemetry, backend integration, or operational authorization.
- Browser smoke checks are not a full WCAG or assistive-technology certification.
- v0.4 is a separately reviewed **static-hosting security evaluation**, not an approval to deploy or connect to the private OS.
- Future updates must pass their own curated private-to-public review, automated tests, security checks, and approved GitHub PR workflow.

The separately maintained private LionRoute workspace, its history and protected systems remain outside this release.
