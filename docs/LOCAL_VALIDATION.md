# Public LionRoute v0.1.0 local release validation

This document concerns only the new public Control Plane demo, NOT the private LionRoute OS system.

## Source provenance and safety

- Source exported by allowlist from a pinned private commit to a fresh independent Git repository with no inherited Git history.
- Relocated public Git root outside the private development workspace.
- User-approved Apache License 2.0 applies only to the sanitized public repository; upstream npm dependencies retain their own license terms.
- Every export path inventoried and reviewed for personal/private identifiers, untracked binaries and rights indicators. Only original LR favicon and synthetic browser screenshot are included as visual assets.
- Fictional fixture explicitly replaces real telemetry, paths, project details and receipts. No credential/provider/broker/dispatch artifacts included.
- Runtime telemetry hook accepts no injected source and is always mock-only. Live gateway factory and SSE transport are removed.
- HTML Content Security Policy blocks browser connections. Browser test attempting an API fetch returned a CSP block.
- Source/HTML/CSS validator forbids common browser network methods and remote embeds; built bundle inspected for removed transport markers.

## Validation evidence (October 17, 2026)

- Public preflight: PASS.
- TypeScript check: PASS.
- Source import and security guard: PASS.
- Vitest: 57/57 tests PASS across 13 files.
- Python review-only sync planner: 6/6 regression tests PASS.
- Production Vite build: PASS.
- Gitleaks v8.30.1: zero findings; scanner binary checksum verified against official release asset digest.
- npm audit: zero vulnerabilities (full dependency set and production-only).
- Chrome local browser reviewed: app and project navigation rendered; demonstration screenshot captured in an isolated extension-free headless browser profile. Local browser API fetch canary blocked by CSP.
- Independent READ-ONLY reviewer: APPROVE for latest local technical security candidate after gateway/SSE and hook hardening. The reviewer did not independently execute the primary full test suite.

## Publication-specific verification

The first reviewed Git commit, GitHub Actions CI run, public visibility change, release tag and anonymous GitHub access test must occur in that order. These are not represented here as completed prematurely. A passing scan is not a guarantee against all unknown vulnerabilities or third-party rights claims.

The private workspace remains private and on its own history. Public updates are separately curated, reviewed and tested before publication.
