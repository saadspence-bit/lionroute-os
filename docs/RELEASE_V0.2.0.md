# LionRoute OS Public Control Plane ? v0.2.0

Release date: **October 22, 2026**

This is an open-source **synthetic-data-only** Control Plane user interface. It is a real working frontend, not the private LionRoute runtime or a hosted live service.

## New in v0.2.0

- Responsive application shell with full text navigation in a mobile/tablet drawer at viewport widths of 900px or less.
- Desktop rail retained for wider screens, with visible menu controls on compact layouts.
- Accessible labeled modal navigation when open. Background main content is inert, scroll is locked and restored, focus moves into the drawer and back to its launcher when dismissed.
- Escape, backdrop, navigation selection and Tab/Shift+Tab focus wrapping.
- Six new focus-model tests (63 total UI tests across 14 test files) and a synthetic screenshot from a 390px viewport.
- Reviewed architecture and acceptance notes linked from the README and roadmap.

## Evidence and review

- Original UI change: pull request #4, merged as 92c6bb7e7b48b4c4f7724fddc9243e68ecdac1dd.
- The post-merge public GitHub Actions run 39764675787 succeeded: dedicated Gitleaks, npm audit, public-disclosure preflight, Python planner tests, source/network guard, TypeScript, Vitest and Vite build.
- Independent read-only review of the UI change reported APPROVE with no blockers.
- Local headless browser checks observed no horizontal page overflow at 360, 390, 768, 900, 1024 and 1440px, plus modal state, keyboard focus restoration and dismissal on a 390px screen.

## How to run

Node.js 24+ and npm 11+ are recommended.

    npm ci
    npm run verify:public
    npm run check:source
    npm run typecheck
    npm test
    npm run build
    npm run dev

The demo is still locked to bundled fictional telemetry and has a Content Security Policy prohibiting browser data connections. It cannot call private gateways, send provider requests, access credentials, execute system commands, or mutate live systems.

## Known limitations and next steps

- No hosted live demo or production backend is included.
- Full assistive-technology acceptance (e.g., VoiceOver/TalkBack) and broad accessibility automation remain future work.
- This is not a production safety certification. Private LionRoute development remains separate, including its Git history, protected records, and infrastructure.
- Future public improvements require curated source review, clean security checks, and independent GitHub PR/CI validation; there is no private-to-public automatic mirror.

This file describes the public v0.2.0 source release; it does not grant approval to publish private LionRoute modules.
