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
    "**/?(*.)+(spec|spec-d).[jt]s?(x)",
  ],
  ignoreDependencies: ["ts-loader", "tslib"],
  project: [
    "**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}!",
    "!vitest.config.stryker.mjs",
    "!**/__mocks__",
  ],
  rollup: {
    entry: "*rollup.config.mjs",
  },
};

export default {
  commitlint: {
    config: "config/commitlint/commitlint.config.js",
  },
  ignoreWorkspaces: [
    "packages/docs/services/inversify-binding-decorators-site",
    "packages/docs/services/inversify-http-open-api-site",
    "packages/docs/services/inversify-logger-site",
    "packages/docs/services/inversify-site",
    "packages/docs/services/inversify-validation-site",
  ],
  workspaces: {
    ".": {
      entry: [],
      ignoreDependencies: defaultWorkspaceProjectConfig.ignoreDependencies,
      project: [],
    },
    "packages/container/examples/*": defaultWorkspaceProjectConfig,
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
    "packages/docs/services/inversify-framework-site": {
      entry: [
        "src/{pages,theme}/**/*.{js,ts,jsx,tsx}",
        "{blog,docs,logger-docs,openapi-docs,validation-docs}/**/*.mdx",
      ],
      ignoreDependencies: ["@docusaurus/faster"],
    },
    "packages/docs/services/inversify-http-site": {
      entry: ["src/{pages,theme}/**/*.{js,ts,jsx,tsx}", "{blog,docs}/**/*.mdx"],
      ignoreDependencies: ["@docusaurus/faster"],
    },
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
    "packages/docs/tools/inversify-http-code-examples": {
      entry: ["src/examples/**/*.ts", "src/scripts/generateExamples/index.mts"],
      ignoreDependencies: defaultWorkspaceProjectConfig.ignoreDependencies,
      project: defaultWorkspaceProjectConfig.project,
    },
    "packages/docs/tools/inversify-http-open-api-code-examples": {
      entry: ["src/examples/**/*.ts", "src/scripts/generateExamples/index.mts"],
      ignoreDependencies: defaultWorkspaceProjectConfig.ignoreDependencies,
      project: defaultWorkspaceProjectConfig.project,
    },
    "packages/docs/tools/inversify-logger-code-examples": {
      entry: ["src/examples/**/*.ts", "src/scripts/generateExamples/index.mts"],
      ignoreDependencies: defaultWorkspaceProjectConfig.ignoreDependencies,
      project: defaultWorkspaceProjectConfig.project,
    },
    "packages/docs/tools/inversify-validation-code-examples": {
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
    "packages/framework/*": defaultWorkspaceProjectConfig,
    "packages/framework/http/libraries/*": defaultWorkspaceProjectConfig,
    "packages/framework/http/tools/e2e-tests": {
      entry: [
        "config/*.mjs",
        "src/*/parameters/*.ts",
        "src/**/step-definitions/*.ts",
        "src/app/hooks/*.ts",
      ],
      ignoreDependencies: [
        ...defaultWorkspaceProjectConfig.ignoreDependencies,
        "ts-node",
      ],
      project: [...defaultWorkspaceProjectConfig.project, "!config/*"],
    },
    "packages/framework/http/tools/http-benchmarks": {
      entry: [
        "src/bin/run.ts",
        "src/k6/scenario/*.ts",
        "src/scenario-setups/*/*.ts",
      ],
      ignoreDependencies: [
        ...defaultWorkspaceProjectConfig.ignoreDependencies,
        "ts-node",
      ],
      project: defaultWorkspaceProjectConfig.project,
    },
    "packages/framework/validation/libraries/*": defaultWorkspaceProjectConfig,
    "packages/json-schema/libraries/*": defaultWorkspaceProjectConfig,
    "packages/logger": defaultWorkspaceProjectConfig,
    "packages/open-api/libraries/*": defaultWorkspaceProjectConfig,
  },
} satisfies KnipConfig;
