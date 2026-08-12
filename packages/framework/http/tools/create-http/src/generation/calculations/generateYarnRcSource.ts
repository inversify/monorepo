export function generateYarnRcSource(): string {
  return `# Prisma and other native addons need install scripts (Yarn 4.14+ defaults enableScripts to false).
enableScripts: true
# Use a node_modules linker so Prisma engines and Node HTTP adapters resolve like npm/pnpm.
nodeLinker: node-modules
`;
}
