import { KnipConfig } from "knip";

type RecordValues<T> = T extends Record<any, infer U> ? U : never;

type WorkspaceProjectConfig = RecordValues<Required<KnipConfig["workspaces"]>>;

const defaultWorkspaceProjectConfig: WorkspaceProjectConfig & {
  entry: string[];
  ignoreDependencies: string[];
  project: string[];
} = {
  entry: [
    "{index,cli,main}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}",
    "src/{index,cli,main}.{js,cjs,mjs,jsx,ts,cts,mts,tsx}",
  ],
  ignoreDependencies: [
    "@inversifyjs/container-benchmarks",
    "@inversifyjs/http-benchmarks",
    "ts-loader",
    "tslib",
  ],
  project: [
    "**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}!",
    "!vitest.config.stryker.mjs",
    "!**/__mocks__",
  ],
};

export default {
  commitlint: {
    config: "config/commitlint/commitlint.config.js",
  },
  ignoreWorkspaces: [
    "packages/docs/services/inversify-binding-decorators-site",
    "packages/docs/services/inversify-site",
  ],
  workspaces: {
    ".": {
      entry: [],
      ignoreDependencies: defaultWorkspaceProjectConfig.ignoreDependencies,
      project: [],
    },
    "packages/container/libraries/*": defaultWorkspaceProjectConfig,
    "packages/container/tools/*": defaultWorkspaceProjectConfig,
    "packages/container/tools/e2e-tests": {
      entry: [
        "config/*.mjs",
        "src/*/parameters/*.ts",
        "src/*/step-definitions/*.ts",
        "src/app/hooks/*.ts",
      ],
      ignoreDependencies: [
        ...defaultWorkspaceProjectConfig.ignoreDependencies,
        "ts-node",
      ],
      project: [...defaultWorkspaceProjectConfig.project, "!config/*"],
    },
    "packages/docs/services/*": defaultWorkspaceProjectConfig,
    "packages/docs/tools/*": defaultWorkspaceProjectConfig,
    "packages/docs/tools/binding-decorators-code-examples": {
      entry: ["src/examples/**/*.ts", "src/scripts/generateExamples/index.mts"],
      ignoreDependencies: defaultWorkspaceProjectConfig.ignoreDependencies,
      project: defaultWorkspaceProjectConfig.project,
    },
    "packages/docs/tools/inversify-code-examples": {
      entry: ["src/examples/**/*.ts", "src/scripts/generateExamples/index.mts"],
      ignoreDependencies: defaultWorkspaceProjectConfig.ignoreDependencies,
      project: defaultWorkspaceProjectConfig.project,
    },
    "packages/foundation/libraries/*": defaultWorkspaceProjectConfig,
    "packages/foundation/tools/*": defaultWorkspaceProjectConfig,
    "packages/foundation/tools/prettier-config": {
      entry: ["{cjs,esm}/index.{js,d.ts}"],
      ignoreDependencies: defaultWorkspaceProjectConfig.ignoreDependencies,
      project: defaultWorkspaceProjectConfig.project,
    },
    "packages/http/libraries/*": defaultWorkspaceProjectConfig,
  },
} satisfies KnipConfig;
