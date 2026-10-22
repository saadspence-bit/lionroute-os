# v0.3 Guided Demo ? Development acceptance

This feature builds on the public, synthetic-only LionRoute OS Control Plane. It does not access or operate the private workspace.

## Demonstration narrative

The guided route contains five independent, read-only destinations:
1. **Projects:** Registry identity versus observer activity.
2. **Operations:** Example run status, stage, nested trace and projected progress.
3. **History / Replay:** Recorded timeline categories and limits of observer projection.
4. **Evidence:** Sample evidence items and why fictional proof is not a real production receipt.
5. **System Map:** Logical relationships among sample state, authority, workers, UI and evidence.

Each stop includes a question, a count derived from the bundled fictional snapshot, an example label, and a navigation control leading to the existing UI screen. None is a command execution or a live connector.

A return-to-guide button preserves the current stop after exploring a screen. Visitors can choose any stop, navigate Previous/Next, or finish and reset. The tour is started from the Command Center or the desktop/mobile navigation menu.

## Local checks performed

- **Unit tests:** 7 new model tests for five unique destinations, fixture-derived metrics, operation identity, empty datasets, index bounds, navigation and allowed destinations. Combined frontend suite: 70 tests across 15 files.
- **Typecheck/build/source guard:** PASS on the first implementation.
- **Browser interaction:** Original local Chrome headless profile using a loopback-only preview. Start guide; choose second stop; open the existing Operations screen; return to the same stop; jump to the System Map stop; finish and return to Command Center.
- **Viewport checks:** 1440, 900, 768, 390 and 360 px, with no horizontal page overflow observed; guided demo opens through mobile navigation at 360 px.
- **Screenshot:** docs/screenshots/guided-demo-v0.3-synthetic.png captured from the fictional-data guide in a local 1422 x 804 browser viewport. No private account or runtime snapshot displayed. Headless browser/preview processes stopped after testing.

## Release boundaries and limitations

- This is a *development candidate*, not a v0.3.0 release, a hosted demo, or an assurance of production behavior.
- Public runtime remains locked to synthetic telemetry and its browser CSP denies application network connections.
- The tour has no broker, provider, cloud, credential, external redirect, hidden job execution or write-back capability.
- The five sample destinations are fixed; counts and names derive from the fictional fixture, never a private endpoint.
- Full assistive-technology acceptance remains future work. Automated functional browser checks are not a comprehensive accessibility certification.
- PR CI, independent read-only review and final publication/merge authorization are separate requirements.
