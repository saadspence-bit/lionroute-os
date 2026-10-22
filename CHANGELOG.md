# Changelog

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

**Public repository:** this public repository. The first public commit was independently initialized without any private Git ancestry. This project currently publishes source code and screenshots; no public live demo hosting or deployment is claimed.
