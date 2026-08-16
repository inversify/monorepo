/**
 * Recipe-driven model for generated `pnpm-workspace.yaml`.
 * Extend this when new pnpm workspace knobs become adapter/db-specific.
 */
export interface PnpmWorkspaceSourceModel {
  allowBuilds: Readonly<Record<string, boolean>>;
  blockExoticSubdeps?: boolean;
}
