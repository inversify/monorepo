export function generateYarnRcSource(): string {
  return `# Disable third-party install scripts by default; opt in packages that need native builds via package.json dependenciesMeta.
enableScripts: false
nodeLinker: node-modules
`;
}
