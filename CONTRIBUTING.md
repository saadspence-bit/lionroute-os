# Contributing

Contributions are welcome through reviewed issues and pull requests. For substantial changes, open an issue first to discuss the design and permission boundary.

Future contributions must keep telemetry synthetic, preserve mock-only runtime mode, avoid production traces/credentials, add tests for changed features, and run:

    npm run check:source
    npm run typecheck
    npm test
    npm run build

Submit changes through reviewed pull requests under the repository Apache-2.0 license; do not merge private-workspace code merely because it is present in another repository. Security-sensitive changes require explicit review and reproducible tests.
