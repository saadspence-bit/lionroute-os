import type { TelemetrySnapshot } from "../types";

/** Synthetic public portfolio telemetry. No private runtime records. */
export const mockTelemetry: TelemetrySnapshot = {
  "currentState": {
    "resourceId": "demo://state/current",
    "project": "LionRoute Demo Workspace",
    "activeStage": "DEMO_SPRINT_03",
    "currentStateStatus": "CURRENT",
    "freshness": "FRESH",
    "nextSafeAction": "Review the next UI iteration",
    "lastAction": "Synthetic sample data validated locally.",
    "missionState": "Fictional example - not a live system",
    "authoritySource": "Static demo fixtures",
    "updatedAt": "2027-02-03T12:36:00Z"
  },
  "operations": [
    {
      "id": "demo-operation-001",
      "traceId": "demo-trace-001",
      "name": "Example Data Import",
      "project": "LionRoute Demo Workspace",
      "workstream": "Data Pipeline",
      "stage": "DEMO_SPRINT_03",
      "actor": "Sample Operator",
      "model": "Example Assistant",
      "status": "running",
      "authorityScope": [
        "Synthetic sample inputs",
        "Local test review"
      ],
      "forbiddenScope": [
        "Production systems",
        "Credentials",
        "External writes"
      ],
      "startedAt": "2027-02-03T12:18:20Z",
      "progressCurrent": 6,
      "progressTotal": 9,
      "nextAction": "Complete the demo quality check",
      "summary": "Fictional project operation for demonstrating read-only observability.",
      "steps": [
        {
          "traceId": "demo-trace-001",
          "operationId": "demo-operation-001",
          "spanId": "s1",
          "eventName": "OPERATION_STARTED",
          "eventType": "operation",
          "step": "Check sample inputs",
          "actor": "Demo Worker",
          "model": "Example Assistant",
          "status": "passed",
          "severity": "success",
          "startedAt": "2027-02-03T12:18:20Z",
          "endedAt": "2027-02-03T12:18:38Z",
          "durationMs": 810,
          "message": "Illustrative step generated for portfolio viewing.",
          "result": "PASS",
          "evidenceRefs": [
            "demo-evidence-001"
          ]
        },
        {
          "traceId": "demo-trace-001",
          "operationId": "demo-operation-001",
          "spanId": "s2",
          "eventName": "STEP_STARTED",
          "eventType": "inventory",
          "step": "Inspect preview",
          "actor": "Demo Worker",
          "tool": "Demo Validator",
          "status": "passed",
          "severity": "success",
          "startedAt": "2027-02-03T12:19:20Z",
          "endedAt": "2027-02-03T12:19:38Z",
          "durationMs": 2140,
          "message": "Illustrative step generated for portfolio viewing.",
          "result": "PASS",
          "evidenceRefs": [
            "demo-evidence-004"
          ]
        },
        {
          "traceId": "demo-trace-001",
          "operationId": "demo-operation-001",
          "spanId": "s3",
          "eventName": "STEP_PASS",
          "eventType": "apply",
          "step": "Validate example results",
          "actor": "Demo Worker",
          "model": "Example Assistant",
          "status": "passed",
          "severity": "success",
          "startedAt": "2027-02-03T12:20:20Z",
          "endedAt": "2027-02-03T12:20:38Z",
          "durationMs": 274000,
          "message": "Illustrative step generated for portfolio viewing.",
          "result": "PASS",
          "evidenceRefs": [
            "demo-evidence-005"
          ]
        },
        {
          "traceId": "demo-trace-001",
          "operationId": "demo-operation-001",
          "spanId": "s4",
          "eventName": "STEP_STARTED",
          "eventType": "verification",
          "step": "Review sample output",
          "actor": "Demo Worker",
          "tool": "Demo Validator",
          "status": "running",
          "severity": "info",
          "startedAt": "2027-02-03T12:21:20Z",
          "progressCurrent": 42,
          "progressTotal": 64,
          "message": "Illustrative step generated for portfolio viewing.",
          "evidenceRefs": []
        },
        {
          "traceId": "demo-trace-001",
          "operationId": "demo-operation-001",
          "spanId": "s4.1",
          "parentSpanId": "s4",
          "eventName": "STEP_PASS",
          "eventType": "verification",
          "step": "Assemble demo proof",
          "actor": "Demo Worker",
          "tool": "Demo Validator",
          "status": "passed",
          "severity": "success",
          "startedAt": "2027-02-03T12:22:20Z",
          "endedAt": "2027-02-03T12:22:38Z",
          "durationMs": 940,
          "message": "Illustrative step generated for portfolio viewing.",
          "result": "PASS",
          "evidenceRefs": [
            "demo-evidence-006"
          ]
        },
        {
          "traceId": "demo-trace-001",
          "operationId": "demo-operation-001",
          "spanId": "s5",
          "eventName": "REVIEW_DISPATCHED",
          "eventType": "review",
          "step": "Record illustration",
          "actor": "Demo Worker",
          "model": "Example Assistant",
          "status": "waiting",
          "severity": "review",
          "startedAt": "2027-02-03T12:23:20Z",
          "message": "Illustrative step generated for portfolio viewing.",
          "evidenceRefs": []
        }
      ]
    },
    {
      "id": "demo-operation-002",
      "traceId": "demo-trace-002",
      "name": "Dashboard Accessibility Review",
      "project": "LionRoute Demo Workspace",
      "workstream": "UI Engineering",
      "stage": "DEMO_UI_01",
      "actor": "Sample Operator",
      "model": "Example Assistant",
      "status": "running",
      "authorityScope": [
        "Synthetic sample inputs",
        "Local test review"
      ],
      "forbiddenScope": [
        "Production systems",
        "Credentials",
        "External writes"
      ],
      "startedAt": "2027-02-03T12:28:20Z",
      "progressCurrent": 4,
      "progressTotal": 7,
      "nextAction": "Review the sample interface",
      "summary": "Fictional project operation for demonstrating read-only observability.",
      "steps": [
        {
          "traceId": "demo-trace-002",
          "operationId": "demo-operation-002",
          "spanId": "u1",
          "eventName": "STEP_PASS",
          "eventType": "architecture",
          "step": "Check sample inputs",
          "actor": "Demo Worker",
          "status": "passed",
          "severity": "success",
          "startedAt": "2027-02-03T12:28:20Z",
          "endedAt": "2027-02-03T12:28:38Z",
          "durationMs": 8000,
          "message": "Illustrative step generated for portfolio viewing.",
          "result": "PASS",
          "evidenceRefs": [
            "demo-evidence-001"
          ]
        },
        {
          "traceId": "demo-trace-002",
          "operationId": "demo-operation-002",
          "spanId": "u2",
          "eventName": "STEP_PROGRESS",
          "eventType": "implementation",
          "step": "Inspect preview",
          "actor": "Demo Worker",
          "model": "Example Assistant",
          "status": "running",
          "severity": "info",
          "startedAt": "2027-02-03T12:29:20Z",
          "progressCurrent": 4,
          "progressTotal": 7,
          "message": "Illustrative step generated for portfolio viewing.",
          "evidenceRefs": []
        }
      ]
    }
  ],
  "workstreams": [
    {
      "id": "demo-workstream-1",
      "name": "Data Pipeline",
      "chatId": "demo-chat-1",
      "project": "LionRoute Demo Workspace",
      "role": "producer",
      "readScope": [
        "Sample read-only data"
      ],
      "writeScope": [
        "demo/data/"
      ],
      "activeOperation": "Example Data Import",
      "currentStep": "Sample quality check",
      "model": "Example Assistant",
      "heavyWorkload": true,
      "authorityState": "granted",
      "startedAt": "2027-02-03T12:18:20Z",
      "status": "running"
    },
    {
      "id": "demo-workstream-2",
      "name": "UI Engineering",
      "chatId": "demo-chat-2",
      "project": "LionRoute Demo Workspace",
      "role": "producer",
      "readScope": [
        "Sample read-only data"
      ],
      "writeScope": [
        "demo/ui/"
      ],
      "activeOperation": "Dashboard Accessibility Review",
      "currentStep": "Interface preview",
      "model": "Example Assistant",
      "heavyWorkload": false,
      "authorityState": "observer",
      "startedAt": "2027-02-03T12:23:20Z",
      "status": "running"
    },
    {
      "id": "demo-workstream-3",
      "name": "Quality Review",
      "chatId": "demo-chat-3",
      "project": "LionRoute Demo Workspace",
      "role": "reviewer",
      "readScope": [
        "Sample read-only data"
      ],
      "writeScope": [],
      "activeOperation": "Example Data Import",
      "currentStep": "Awaiting demo review",
      "model": "Example Assistant",
      "heavyWorkload": false,
      "authorityState": "waiting",
      "startedAt": "2027-02-03T12:28:20Z",
      "status": "waiting"
    }
  ],
  "evidence": [
    {
      "id": "demo-evidence-001",
      "kind": "receipt",
      "title": "Synthetic input check",
      "result": "PASS",
      "status": "verified",
      "source": "Public demo fixture",
      "recordedAt": "2027-02-03T12:20:20Z",
      "detail": "Synthetic example only. No actual operational history, credential, or receipt is included."
    },
    {
      "id": "demo-evidence-002",
      "kind": "review",
      "title": "Example independent review",
      "result": "REVIEWED",
      "status": "verified",
      "source": "Public demo fixture",
      "recordedAt": "2027-02-03T12:21:20Z",
      "detail": "Synthetic example only. No actual operational history, credential, or receipt is included."
    },
    {
      "id": "demo-evidence-003",
      "kind": "test",
      "title": "Demonstration test suite",
      "result": "PASS",
      "status": "verified",
      "source": "Public demo fixture",
      "recordedAt": "2027-02-03T12:22:20Z",
      "detail": "Synthetic example only. No actual operational history, credential, or receipt is included."
    },
    {
      "id": "demo-evidence-004",
      "kind": "hash",
      "title": "Sample inventory",
      "result": "RECORDED",
      "status": "recorded",
      "source": "Public demo fixture",
      "recordedAt": "2027-02-03T12:23:20Z",
      "detail": "Synthetic example only. No actual operational history, credential, or receipt is included."
    },
    {
      "id": "demo-evidence-005",
      "kind": "receipt",
      "title": "Fictional completion receipt",
      "result": "EXAMPLE",
      "status": "recorded",
      "source": "Public demo fixture",
      "recordedAt": "2027-02-03T12:24:20Z",
      "detail": "Synthetic example only. No actual operational history, credential, or receipt is included."
    },
    {
      "id": "demo-evidence-006",
      "kind": "hash",
      "title": "Mock integrity check",
      "result": "UNCHANGED",
      "status": "verified",
      "source": "Public demo fixture",
      "recordedAt": "2027-02-03T12:25:20Z",
      "detail": "Synthetic example only. No actual operational history, credential, or receipt is included."
    }
  ],
  "authority": [
    {
      "id": "demo-rule-001",
      "label": "Read synthetic records",
      "state": "allowed",
      "scope": "Sample data and local demonstration only",
      "source": "Example UI policy",
      "detail": "Visual explanation of a policy boundary; this data does not grant real authority."
    },
    {
      "id": "demo-rule-002",
      "label": "Edit local examples",
      "state": "allowed",
      "scope": "Sample data and local demonstration only",
      "source": "Demo write policy",
      "detail": "Visual explanation of a policy boundary; this data does not grant real authority."
    },
    {
      "id": "demo-rule-003",
      "label": "Access real credentials",
      "state": "forbidden",
      "scope": "Sample data and local demonstration only",
      "source": "Privacy example",
      "detail": "Visual explanation of a policy boundary; this data does not grant real authority."
    },
    {
      "id": "demo-rule-004",
      "label": "Mutate live authority",
      "state": "forbidden",
      "scope": "Sample data and local demonstration only",
      "source": "Fictional policy fixture",
      "detail": "Visual explanation of a policy boundary; this data does not grant real authority."
    },
    {
      "id": "demo-rule-005",
      "label": "Execute remote work",
      "state": "forbidden",
      "scope": "Sample data and local demonstration only",
      "source": "Fictional policy fixture",
      "detail": "Visual explanation of a policy boundary; this data does not grant real authority."
    },
    {
      "id": "demo-rule-006",
      "label": "Request human review",
      "state": "required",
      "scope": "Sample data and local demonstration only",
      "source": "Approval scenario",
      "detail": "Visual explanation of a policy boundary; this data does not grant real authority."
    }
  ],
  "capabilityRegistry": {
    "schemaVersion": "1.0.0",
    "registryVersion": "1.1.1",
    "baselineId": "DEMO_BASELINE_01",
    "lastSyncedAt": "2027-02-03",
    "globalRule": "All illustrated capabilities are simulated and inactive.",
    "source": "demo-capability-registry.json",
    "entries": [
      {
        "stageId": "DEMO_1",
        "name": "Sample Task Queue",
        "status": "sealed",
        "authority": "demo-only",
        "capabilities": [
          "local examples",
          "read-only display"
        ],
        "projects": [
          "fictional"
        ],
        "activationRule": "No activation is possible in public demo mode.",
        "restrictions": [
          "No provider access or real actions"
        ]
      },
      {
        "stageId": "DEMO_2",
        "name": "Example Review Workflow",
        "status": "sealed_governed_inactive",
        "authority": "demo-only",
        "capabilities": [
          "local examples",
          "read-only display"
        ],
        "projects": [
          "fictional"
        ],
        "activationRule": "No activation is possible in public demo mode.",
        "restrictions": [
          "No provider access or real actions"
        ]
      }
    ]
  },
  "projectRegistry": {
    "registrySchemaVersion": 2,
    "baselineId": "DEMO_BASELINE_01",
    "source": "LIONROUTE_PORTFOLIO_SYNC_INDEX.json",
    "projects": [
      {
        "projectId": "lionroute-os",
        "projectName": "LionRoute Demo Workspace",
        "projectType": "demo",
        "legacyProjectId": null,
        "registryStatus": "active",
        "connectionStatus": "documented_not_runtime_connected",
        "bootstrapState": null,
        "bootstrapStandardVersion": null,
        "projectRootKnown": true,
        "integrationContractKnown": false,
        "projectProfileKnown": false
      },
      {
        "projectId": "demo-analytics",
        "projectName": "Cedar Analytics",
        "projectType": "demo",
        "legacyProjectId": "sample-analytics",
        "registryStatus": "active",
        "connectionStatus": "documented_not_runtime_connected",
        "bootstrapState": null,
        "bootstrapStandardVersion": null,
        "projectRootKnown": true,
        "integrationContractKnown": true,
        "projectProfileKnown": true
      },
      {
        "projectId": "demo-notes",
        "projectName": "Harbor Notes",
        "projectType": "demo",
        "legacyProjectId": null,
        "registryStatus": "review",
        "connectionStatus": "root_path_not_yet_confirmed",
        "bootstrapState": null,
        "bootstrapStandardVersion": null,
        "projectRootKnown": false,
        "integrationContractKnown": false,
        "projectProfileKnown": false
      }
    ]
  },
  "icmController": {
    "policySchema": "lionroute.icm-ops-controller-policy.v1",
    "controllerSchema": "lionroute.icm-ops-controller.v1",
    "controllerVersion": "0.1-demo",
    "source": "icm-ops-controller-policy.v1.json",
    "writeAuthorityMode": "CONTROLLER_BROKER_ONLY",
    "realModelDispatch": false,
    "fableBulkWorkAllowed": false,
    "providerCallsAllowed": 0,
    "reviewerLiveReadAllowed": false,
    "claimBoundary": {
      "cooperativeLocalWorkers": true,
      "hostileSameUserWorkers": false,
      "untrustedRealModelWorkers": false
    },
    "liveState": {
      "state": "projected",
      "integrity": "sqlite-structural-verified",
      "activeLeaseCount": 2,
      "quarantinedLeaseCount": 1,
      "protectedLeaseCount": 3
    },
    "collisionState": {
      "state": "quarantine-present",
      "overlapDetected": false
    }
  },
  "federation": {
    "realModelDispatchActivated": false,
    "dispatchAuthoritySource": "public-fixture-false",
    "policyMode": "EXAMPLE",
    "policyVersion": "0.1-demo",
    "taskDomains": [
      "code-implementation",
      "independent-review",
      "planning"
    ],
    "taskClassMappings": [
      {
        "taskDomain": "code-implementation",
        "taskStoreClass": "bounded-multi-file",
        "modelRoutingPolicyClass": "bounded-multi-file"
      }
    ],
    "cliRegistryVersion": "0.1-demo",
    "modelCatalogVersion": "0.1-demo",
    "workerQualificationVersion": "0.1-demo",
    "cliAdapters": [
      {
        "cliId": "example-cli",
        "displayName": "Sample Worker",
        "vendorFamily": "fictional",
        "lifecycleState": "REGISTERED",
        "adapterMode": "prepared",
        "adapterRegistryEnabled": true,
        "roles": [
          "worker",
          "reviewer",
          "planner"
        ],
        "capabilities": [
          "text-generation",
          "code-implementation",
          "code-review",
          "planning"
        ],
        "readOnlyControl": "supported",
        "sandboxControl": "supported"
      }
    ],
    "models": [
      {
        "modelId": "demo-model-a",
        "modelFamily": "fictional",
        "hostKind": "mock",
        "providerId": "example-cli",
        "candidateOrigin": "synthetic",
        "verificationState": "UNVERIFIED",
        "cliIds": [
          "example-cli"
        ],
        "effortLevels": [
          "low",
          "medium",
          "high"
        ],
        "capabilityTags": [
          "text-generation",
          "code-implementation",
          "code-review",
          "planning"
        ]
      }
    ],
    "workerQualifications": [
      {
        "workerId": "example-cli/demo-model-a",
        "cliId": "example-cli",
        "adapterId": "example-cli",
        "modelId": "demo-model-a",
        "qualificationState": "ADAPTER_QUALIFIED_PREPARED",
        "realDispatchState": "REAL_MODEL_DISPATCH_NOT_AUTHORIZED",
        "roles": [
          "worker",
          "reviewer",
          "planner"
        ],
        "capabilityTags": [
          "text-generation",
          "code-implementation",
          "code-review",
          "planning"
        ],
        "effortLevels": [
          "low",
          "medium",
          "high"
        ],
        "strengthTier": 3,
        "localExecution": false,
        "networkRequiredForInference": false,
        "writeSupport": true,
        "sandboxSupport": true,
        "readOnlySupport": true,
        "availability": false,
        "reliabilityTier": 1,
        "observedAt": "2027-02-03T12:00:00Z"
      }
    ],
    "pluginRegistry": {
      "state": "not-projected",
      "detail": "No plugins or accounts are connected in the public demonstration."
    },
    "sources": [
      "demo-cli.json",
      "demo-models.json",
      "worker-qualification.v1.json"
    ]
  },
  "routingProvenance": {
    "contractSchemaVersion": "1.0.0",
    "contractSource": "demo-routing-schema.json",
    "requiredFieldCount": 22,
    "requiredFields": [
      "schemaVersion",
      "decisionId",
      "taskDomain",
      "policyMode",
      "policyVersion",
      "scoringWeightVersion",
      "selectedCliId",
      "selectedModelId",
      "selectedEffort",
      "selectedAdapterId",
      "rejectedCandidates",
      "independenceProof",
      "costEstimate",
      "latencyEstimate",
      "qualityEstimate",
      "fallbackCliId",
      "fallbackModelId",
      "fallbackDepth",
      "escalationThreshold",
      "confidence",
      "determinismTuple",
      "decidedAt"
    ],
    "determinismTupleFieldCount": 9,
    "determinismTupleFields": [
      "normalizedTaskHash",
      "policyVersion",
      "scoringWeightVersion",
      "cliRegistryVersion",
      "modelCatalogVersion",
      "capabilitySnapshotHash",
      "operationalStateSnapshotHash",
      "priceSnapshotHash",
      "routingMode"
    ],
    "producer": "ExamplePlanner",
    "consumer": "ExampleInspector",
    "currentDecisionStore": {
      "state": "not-projected",
      "count": 0,
      "detail": "This demonstration has no real routing-decision ledger."
    },
    "historicalProof": {
      "state": "not-projected",
      "detail": "No production proof records are included."
    }
  },
  "systemNodes": [
    {
      "id": "ui",
      "label": "Dashboard",
      "category": "ui",
      "status": "running",
      "subtitle": "Synthetic example node"
    },
    {
      "id": "lcl",
      "label": "Sample State",
      "category": "state",
      "status": "passed",
      "subtitle": "Synthetic example node"
    },
    {
      "id": "icm",
      "label": "Demo Policy",
      "category": "authority",
      "status": "passed",
      "subtitle": "Synthetic example node"
    },
    {
      "id": "runtime",
      "label": "Example Events",
      "category": "runtime",
      "status": "running",
      "subtitle": "Synthetic example node"
    },
    {
      "id": "evidence",
      "label": "Sample Evidence",
      "category": "evidence",
      "status": "passed",
      "subtitle": "Synthetic example node"
    },
    {
      "id": "core",
      "label": "Example Worker",
      "category": "worker",
      "status": "running",
      "subtitle": "Synthetic example node"
    },
    {
      "id": "reviewer",
      "label": "Mock Reviewer",
      "category": "worker",
      "status": "waiting",
      "subtitle": "Synthetic example node"
    }
  ],
  "systemEdges": [
    {
      "id": "e-lcl-ui",
      "source": "lcl",
      "target": "ui",
      "label": "sample relation"
    },
    {
      "id": "e-runtime-ui",
      "source": "runtime",
      "target": "ui",
      "label": "sample relation"
    },
    {
      "id": "e-evidence-ui",
      "source": "evidence",
      "target": "ui",
      "label": "sample relation"
    },
    {
      "id": "e-icm-core",
      "source": "icm",
      "target": "core",
      "label": "sample relation"
    },
    {
      "id": "e-core-runtime",
      "source": "core",
      "target": "runtime",
      "label": "sample relation"
    },
    {
      "id": "e-core-evidence",
      "source": "core",
      "target": "evidence",
      "label": "sample relation"
    },
    {
      "id": "e-evidence-reviewer",
      "source": "evidence",
      "target": "reviewer",
      "label": "sample relation"
    }
  ]
};
