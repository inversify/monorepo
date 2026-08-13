/**
 * Recipe-driven Yarn allow-list for packages that need install-time scripts.
 * Written to generated `package.json` `dependenciesMeta` (not `.yarnrc.yml`).
 */
export interface YarnRcSourceModel {
  dependenciesMeta: Readonly<Record<string, { built: true }>>;
}
