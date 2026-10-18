# LionRoute: private development + public portfolio updates

LionRoute has **two destinations**, not two uncontrolled copies:

| Track | Purpose | Visibility | Update policy |
| --- | --- | --- | --- |
| Private LionRoute workspace | Full system, private context, protected runtime, experimental integrations | Private | Existing governed branch, validation and Git procedures |
| Public LionRoute Control Plane | Selected working code, fictional data, public tests, architecture, roadmap and releases | Intended open-source portfolio (pending first publication) | Curated, reviewed changes only |

The public repository serves **both** as reusable open-source code and an employer portfolio. An approved OSI-compatible license remains a separate decision; see [Licensing](LICENSING_DECISION.md).

## Each meaningful development milestone

1. Complete and validate the private feature through its authorized private workflow.
2. Run the read-only committed-source update plan (with the real private app directory substituted):

       python -B scripts/plan-public-updates.py plan --private-app <PRIVATE_CONTROL_PLANE_DIRECTORY>

   It compares only 28 explicitly admitted frontend paths. It does not read private credentials, provider state or historical commits, and never connects to GitHub.
3. If the plan finds a change, optionally prepare a private quarantine package **outside either repository**:

       python -B scripts/plan-public-updates.py prepare --private-app <PRIVATE_CONTROL_PLANE_DIRECTORY> --review-dir <NEW_ABSOLUTE_REVIEW_DIRECTORY>

   These files are unreviewed and **not public**. This does not overwrite the public candidate, stage Git changes or publish.
4. Independently inspect proposed code, new imports, rights, private identifiers, dependency changes and public mock-only boundary. Manually port only sanitized approved parts and tests into the public repository.
5. Revalidate: `npm run verify:public`, `npm run check:source`, `npm run typecheck`, `npm test`, `npm run build`, and `python -B -m unittest discover -s scripts -p 'test_plan_public_updates.py'`. Add dedicated secret scan, file-by-file disclosure review and independent security assessment.
6. After owner approval of the **exact reviewed files and public destination**, create a separate public commit/PR, update CHANGELOG.md and ROADMAP.md, and publish. Public CI checks each commit and PR after GitHub activation.

## Planner states

- `MATCH`: no update needed.
- `PRIVATE_CHANGE_REVIEW_REQUIRED`: only the committed private file changed. The file can be quarantined for review.
- `MATCH_NEW_BASELINE_REVIEW_REQUIRED`: public/private code matches but a previous reviewed release changed the baseline; explicitly refresh baseline after release review.
- `DIVERGED_MANUAL_MERGE_REQUIRED`: both differ from the approved baseline. The planner refuses automatic preparation.
- Uncommitted eligible private changes, malformed paths, symlinks, oversized files, suspicious marker values and review directories inside either repository fail closed.
- New source files and all private fixtures, backend authority, runtime state, provider adapters, credentials, operational receipts and private documentation **require independent admission** and are not auto-exported.

## Update rhythm and employer visibility

Show meaningful validated updates, ideally a short weekly engineering note when there is real progress, and versioned releases for major improvements. Each update should explain what changed, how it was tested, its limitation and next milestone. GitHub issues, PRs, release notes and the changelog should represent actual work; do not invent activity.

The private repository may be ahead/behind its GitHub remote or contain concurrent changes. This workflow does **not** merge, commit or push private branches; use their existing reviewed Git procedure. A private feature may precede its public sanitized release.

**Placement:** The standalone public repository is now outside the private LionRoute workspace. Keep the two Git roots separate, with independent reviews and histories.

The update planner and proposed CI grant **no publication authority**, do not schedule unattended publishing and never bridge the private and public Git histories.
