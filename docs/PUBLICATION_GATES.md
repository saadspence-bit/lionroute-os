# Publication gates

A passing local build is not authority to publish.

- [x] Pinned-source, allowlisted export with no copied private Git history
- [x] Synthetic telemetry replacing operational samples
- [x] Runtime forced to mock mode even with gateway environment variables
- [x] Local review-only source update planner and 28-path baseline; no mirror or auto-publish
- [x] 57 unit tests, 6 Python update-planner tests, typecheck, source-check, production build
- [x] All export paths, readable source and generated synthetic screenshot inventoried; no private-history or secret indicators found in candidate
- [x] Source rights reviewed to project-owner scope, with upstream npm licenses recorded
- [x] Standalone public candidate relocated outside the private workspace
- [x] Gitleaks v8.30.1 scan (official release checksum verified): zero findings on local candidate
- [x] Candidate identifiers, topology fixture provenance and original SVG reviewed as fictional/sample content
- [x] Owner authorized Apache-2.0; full official license text included; npm dependency licenses inventoried
- [x] Third-party dependency/asset/attribution inventory reviewed; no vendor code or private images copied into export
- [x] Browser functional/semantic review and synthetic-only screenshot; CSP network-block canary passed
- [x] Browser semantic navigation and mock-only UI reviewed; comprehensive assistive-technology validation remains a future roadmap improvement
- [x] Independent reviewer accepted local technical security candidate after removing gateway/SSE and adding CSP; first live publication still subject to GitHub CI
- [ ] Clean independent Git initialization and approved first commit
- [x] Owner explicitly approved Apache 2.0, separate public GitHub repository and first publication
- [ ] Anonymous read verification after publication

Never push any ancestry, credentials, files, or Git metadata from the private LionRoute workspace; no automatic private-to-public sync.
