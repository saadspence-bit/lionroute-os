# v0.4 - Live reviewed static hosting (synthetic-only)

## Purpose and verified status

**Public demo:** https://saadspence-bit.github.io/lionroute-os/

The Apache-2.0-licensed LionRoute OS public Control Plane is now hosted on GitHub Pages as a **fictional, read-only browser demonstration**. It is not a production LionRoute service. The website does not connect to the private LionRoute workspace, control a laptop or Chat On Steroids, handle real credentials, run models, execute commands, or grant operator authority.

The latest formal tagged source release remains **v0.3.0**. The v0.4 hosting milestone is deployed, but **v0.4.0 has not been formally tagged or released**.

## Source, approval and deployment evidence

- [Reviewed PR #8](https://github.com/saadspence-bit/lionroute-os/pull/8) - security review APPROVE at reviewed source 7bfa221d4ebcb021be86fd9df20e8662d240ca5d, then merged.
- [Public main merge commit](https://github.com/saadspence-bit/lionroute-os/commit/5e4a06ba2848449be9a716aaf748b149abb44312) - 5e4a06ba2848449be9a716aaf748b149abb44312.
- [Post-merge validation](https://github.com/saadspence-bit/lionroute-os/actions/runs/40053822500) - SUCCESS against that exact public main commit.
- [Owner-authorized manual Pages deployment](https://github.com/saadspence-bit/lionroute-os/actions/runs/40054294574) - SUCCESS on 2026-10-24 UTC against that same commit, both verify-and-package and deploy jobs passing.
- GitHub Pages was configured for **GitHub Actions** publishing with HTTPS enforced, no custom domain, and a github-pages environment allowing **main** only. This is a repository-project site under /lionroute-os/.
- Anonymous HTTPS GET returned **200**. Desktop Chrome loaded the public React application and five-stop tour. Separate headless mobile Chrome at **390px** verified no horizontal page overflow, five tour stops, and explicit fictional-data disclosure. Browser CSP blocked a test API fetch; the mobile run observed no external HTTP requests. These are scoped smoke checks, not complete production or security certification.

## Architecture and trust boundary

- Vite uses base / in local development. Only npm run build:pages explicitly enables the reviewed /lionroute-os/ asset path.
- HTML includes a meta Content Security Policy: default-src none, script-src self, style-src self with unsafe-inline, img-src self and data, font-src self, connect-src none, object-src none, base-uri none, and form-action none.
- All JavaScript, CSS and favicon build references use local assets under /lionroute-os/. The runtime telemetry source is explicitly pinned to fictional in-repository data; source validation rejects browser network and mutation APIs.
- The fail-closed Pages verifier checks HTML CSP, asset references, unexpected files, symlinks and dotfiles, source maps, custom domains, file count and bundle byte caps. The Pages upload excludes hidden files; no hidden .nojekyll marker is generated or required.
- GitHub Pages serves **static files only**. No dynamic backend, real authentication, payment service, cookies, operator control, API keys or provider integration is part of this hosted build.
- The CSP is a **meta** policy, not a claim that GitHub Pages supplies arbitrary response headers. In particular, this repository does not enforce HTTP-header-only directives such as frame-ancestors.
- Site content is visible to the public. Future updates must never expose private project records, live telemetry, identifying logs or secrets.

## Controlled deployment model for future updates

The published .github/workflows/pages-manual.yml has **workflow_dispatch only**. Pushes, pull requests, merges and release tags do **not** redeploy the site. A deployment requires the repository owner, main branch, exact approved 40-character main commit SHA, and the manual confirmation phrase. Only the separate deployment job has pages:write and id-token:write; the build job has read-only repository permissions. All external actions in the **manual Pages workflow** are pinned to upstream commit SHAs (the separate general CI workflow is not described by this claim).

The github-pages deployment environment is restricted to main. Do not imply required human environment reviewers are configured: account/plan support and current settings must be checked before making that claim. For any later update, independently review and test the new source, obtain appropriate owner approval, dispatch with that exact SHA, and repeat anonymous hosted smoke tests. A change to public main alone does **not** replace the already hosted artifact.

## Reproducible local validation

    npm ci --ignore-scripts
    npm audit --audit-level=high
    npm run verify:public
    npm run check:source
    npm run typecheck
    npm test
    npm run test:pages
    npm run build:pages
    npm run verify:pages

The general CI workflow additionally runs the Python update-planner tests and pinned Gitleaks secret scanning. Linux CI exercises the symlink-denial test; Windows without symlink privileges can skip that one local fixture.

## Future deployment checklist

1. Independently review proposed changes to public source, source disclosure, and manual deployment workflow; resolve any blockers.
2. Merge only approved public changes and confirm post-merge CI succeeds on the exact public main SHA.
3. Obtain the owner's authorization for another external deployment using that reviewed SHA.
4. Verify Pages source, environment restrictions, pinned workflow actions and repository settings still match approved policy.
5. Manually dispatch from main with the approved commit SHA and required confirmation; wait for successful verify-and-package and deploy jobs.
6. Recheck the public URL anonymously, local JS/CSS/favicon, fictional disclosure, CSP-denied API fetch, guided tour, 390px mobile layout and absence of unexpected requests.
7. Publish release notes or update links only for verified deployed bytes. Disable hosting through an approved owner-controlled response if disclosure or access checks fail.

## Limits

GitHub Pages quotas and account settings may change. Public static hosting is not private, authenticated application hosting. A meta CSP does not replace server-enforced security headers; basic browser smoke tests do not certify complete accessibility, vulnerability resistance or provenance.

This milestone adds no custom domain, cloud payment account, secret, analytics, tracking, live provider connection, automatic deployment trigger, npm publication, or private-to-public code mirroring.
