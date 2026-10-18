# Contributing

Contributions are welcome through reviewed issues and pull requests. For substantial changes, open an issue first to discuss the design and permission boundary.

Future contributions must keep telemetry synthetic, preserve mock-only runtime mode, avoid production traces/credentials, add tests for changed features, and run:

    npm run check:source
    npm run typecheck
    npm test
    npm run build

Use reviewed pull requests after an explicit contribution and licensing policy is established.
