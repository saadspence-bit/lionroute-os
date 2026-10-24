# LionRoute OS — Public Control Plane Demo

This portfolio project demonstrates an **observer-only operations dashboard** using React, TypeScript, Vite, and entirely fictional data. Real, reviewed engineering code is open-source; no private LionRoute runtime data or credentials are shipped.

**Current source version: v0.4.0 - Reviewed static hosting.** All sample project names, events, timestamps, evidence, model assignments and policy records are synthetic. The demo does not operate the real LionRoute OS.

## Public preview (entirely fictional sample data)

![LionRoute OS Control Plane synthetic Command Center](docs/screenshots/control-plane-command-center-synthetic.png)

*Screenshot generated from the local mock-only browser build. All displayed activity, evidence and project information are fictional and not production telemetry.*

## Responsive navigation (v0.2.0)

The reviewed v0.2.0 update introduces a responsive Command Center on tablets and phones and an accessible compact navigation drawer. The drawer provides active-page announcements, keyboard focus wrapping, Escape-to-close, focus restoration, and scroll locking while open. The desktop navigation remains available at wider screen sizes.

![Mobile navigation in the v0.2 synthetic demo](docs/screenshots/control-plane-v0.2-mobile-navigation.png)

*Generated from a 390-pixel Chrome viewport using the synthetic-only demo, included in the v0.2.0 release.* See [responsive acceptance notes](docs/RESPONSIVE_ACCEPTANCE.md).

## Guided Demo (v0.3.0)

A new five-stop interactive walkthrough helps visitors explore the **fictional** project registry, operations and nested traces, observer-derived history, example evidence, and the logical system map. Visitors can open each existing view, return to the same walkthrough stop, jump between stops, or finish the guide.

![Synthetic Guided Demo walkthrough](docs/screenshots/guided-demo-v0.3-synthetic.png)

*Original screenshot from the local synthetic-only Guided Demo included with the v0.3.0 source release; not a hosted production service.* See [Guided Demo acceptance](docs/GUIDED_DEMO_ACCEPTANCE.md).

## Live public demo (v0.4 hosting milestone)

**[Launch the LionRoute OS Control Plane demo](https://saadspence-bit.github.io/lionroute-os/)** - a publicly accessible, read-only website using bundled, entirely fictional data. It does **not** connect to the private LionRoute OS, operate a real system, or show production activity.

The v0.4 static-hosting milestone was independently reviewed in [PR #8](https://github.com/saadspence-bit/lionroute-os/pull/8), merged as public commit [5e4a06b](https://github.com/saadspence-bit/lionroute-os/commit/5e4a06ba2848449be9a716aaf748b149abb44312), and deployed with [successful owner-authorized GitHub Actions run #40054294574](https://github.com/saadspence-bit/lionroute-os/actions/runs/40054294574). Anonymous HTTPS access, the five-stop guided tour, a 390px mobile layout, and CSP blocking of a test API request were verified after deployment. The v0.4.0 source release documents this reviewed hosting milestone; publication of a source tag does **not** trigger another website deployment.

Deployment is **manual-only**: pushes, merges, and tags do not redeploy the site. Every future deployment requires a separate approved public-main commit SHA and owner dispatch. See [hosting controls and verification evidence](docs/STATIC_HOSTING_V0.4.md) and [v0.4.0 release notes](docs/RELEASE_V0.4.0.md).

## Features
Command Center; Operations with nested traces; History / Replay; Projects; Agents & Models; Workstreams; System Map; Evidence; Authority; and read-only Terminal. Filtering, keyboard navigation and drill-down are presentation behavior, not system actions.

## Local setup
Requires Node.js 24+ and npm 11+. All displayed records are synthetic; no accounts or private API keys are needed.

    npm ci
    npm run check:source
    npm run typecheck
    npm test
    npm run build
    npm run dev

Then open http://127.0.0.1:4317 in a browser. No credentials, services, API keys or backend are required.

## Trust boundary
The app is hard-locked to local synthetic telemetry even if gateway environment variables are supplied. The Terminal view is a structured event viewer, NOT a shell. There is no authority to execute commands, call model providers, change policies, spend money, or publish anything. Demo badges and evidence are examples, not verified production results.

See docs/ARCHITECTURE.md, docs/RESPONSIVE_ACCEPTANCE.md, docs/GUIDED_DEMO_ACCEPTANCE.md, docs/RELEASE_V0.3.0.md, docs/RELEASE_V0.2.0.md, docs/DUAL_TRACK_UPDATES.md, docs/LICENSING_DECISION.md, ROADMAP.md, SECURITY.md, and CHANGELOG.md.

## Learning in public
This public repository shows reviewed iterations through Git commits, passing CI, release notes, a roadmap, and independent update history. The private workspace is never mirrored automatically. A read-only update planner compares a small approved subset of committed private source files and flags them for manual sanitization; it cannot push, merge, grant publication authority, or import private history.

## License
The public Control Plane project is licensed under **Apache License 2.0** (see [LICENSE](LICENSE)). Dependencies retain their own licenses, documented in [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md). The separate private LionRoute workspace is not part of this license grant.
