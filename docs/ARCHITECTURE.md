# Public demo architecture

Synthetic fixture -> mockTelemetrySource -> React Query -> read-only feature components.

The shipped browser app always resolves runtime telemetry from the bundled synthetic fixture. Gateway parsing functions may remain for contract-level tests but cannot be selected through runtime configuration in this portfolio build.

Features present observations and local UI selections: operations, traces, history, projects, workers, topology, evidence and sample authority rules. No business logic here grants permissions, authenticates to providers, executes shell commands or mutates the system.

Excluded by design: the private Core and ICM implementations, protected LCL state, runtime ledgers, credentials, real session metadata, provider accounts, project integrations and operational proofs.
