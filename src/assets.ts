/// <reference types="vite/client" />

/** Public assets follow the deployment path; direct Node tests use the root. */
export const assetUrl = (path: string) =>
  `${import.meta.env?.BASE_URL ?? "/"}${path.replace(/^\/+/, "")}`;
