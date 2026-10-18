/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIONROUTE_TELEMETRY_SOURCE?: "mock" | "gateway";
  readonly VITE_LIONROUTE_GATEWAY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
