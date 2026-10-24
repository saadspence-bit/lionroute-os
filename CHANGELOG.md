# Changelog

## Unreleased - v0.4 static-hosting milestone (site deployed; release tag pending)

- Add an opt-in GitHub Pages build with correct repository subpath, locally bundled assets and verified CSP.
- Add fail-closed static bundle checks and offline denial/regression tests; retain fictional-data and network isolation.
- Prepare a pinned-action, owner-dispatched-only Pages workflow with read-only build and separate Pages-write deployment jobs.
- Extend GitHub CI to validate the Pages build; code pushes, merges and tags do not deploy the public site.
- Independently reviewed public PR #8; merged commit 5e4a06ba2848449be9a716aaf748b149abb44312. Owner-authorized manual Pages deployment run 40054294574 passed both verification and deployment jobs (2026-10-24 UTC).
- Public fictional-only demo: [live site](https://saadspence-bit.github.io/lionroute-os/). Anonymous HTTPS and browser checks verified desktop UI, five guided stops, 390px mobile layout, and test API fetch blocked by meta CSP. Private runtime and credentials were not connected. Future deployments remain owner-dispatched and exact-SHA gated.
- The public hosting milestone is deployed, but no v0.4.0 formal source-release tag has been published.


## v0.3.0 (2026-10-22) ? v0.3 Guided Interactive Demonstrations

- Add a five-stop guided walkthrough spanning sample projects, operations, trace history, evidence and a logical system map.
- Derive demo sample labels and counts from the existing bundled fictional telemetry, with empty-data fallbacks.
- Add read-only navigation into existing screens, a return-to-guide action that preserves the selected stop, and a finish/reset path.
- Include seven new guided-demo model tests, local browser interactions and an original synthetic screenshot.
- Keep the demo fully local, observer-only and network-denied; no real provider, credential, job action or deployment added.
- Independently reviewed feature pull request #6 merged into public main as dad35532043cec5fb6e32d81657036aee314553d; post-merge GitHub Actions run 39854654631 passed. This source release does not include hosting or production telemetry.


## v0.2.0 ? Responsive Command Center (2026-10-22)

- Replace cramped mobile navigation with a labeled keyboard-accessible drawer at widths of 900 pixels and below.
- Preserve the desktop rail on wider screens, with focus management, Escape and backdrop dismissal, and page selection.
- Introduce a compact navigation model with six regression tests; baseline UI tests and synthetic-only guards remain active.
- Add an original fictional-data mobile screenshot and responsive browser-acceptance evidence.
- Approved pull request #4 merged to public main with successful post-merge GitHub Actions; preserved existing private LionRoute workspace and synthetic-only application boundary.


## v0.1.0 ? Initial public Control Plane demo (2026-10-17)

- Exported an explicit allowlist of browser Control Plane source files to a standalone local folder with no private Git history.
- Replaced internal operational fixture values with fictional projects, operations, traces, evidence and policy examples.
- Hard-locked runtime telemetry selection to mock-only, including when gateway variables are present.
- Preserved typed React dashboard views, source invariants, and unit tests.
- Published public-first documentation, a synthetic screenshot, and GitHub Actions CI with pinned Gitleaks, npm audit, source-boundary checks, 57 frontend tests, six update-planner tests, typecheck, and build.
- Added a nonpublishing committed-source update planner, a 28-file baseline and offline failure-mode tests.

**Public repository:** this public repository. The first public commit was independently initialized without any private Git ancestry. The v0.1.0 milestone published source code and screenshots only; the separately authorized v0.4 hosting milestone added a live synthetic-only GitHub Pages demo.
