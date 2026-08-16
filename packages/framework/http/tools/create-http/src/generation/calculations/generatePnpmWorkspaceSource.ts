import { type PnpmWorkspaceSourceModel } from '../models/PnpmWorkspaceSourceModel.js';

function formatYamlKey(key: string): string {
  if (/^[A-Za-z_][\w-]*$/.test(key)) {
    return key;
  }

  return `'${key}'`;
}

export function generatePnpmWorkspaceSource(
  model: PnpmWorkspaceSourceModel,
): string {
  const lines: string[] = [
    '# Allow Prisma install scripts (pnpm 10+ blocks dependency build scripts by default).',
    'allowBuilds:',
  ];

  for (const [packageName, allowed] of Object.entries(model.allowBuilds)) {
    lines.push(`  ${formatYamlKey(packageName)}: ${String(allowed)}`);
  }

  if (model.blockExoticSubdeps !== undefined) {
    lines.push(
      '# Allow git-hosted uWebSockets.js pulled in by @inversifyjs/http-uwebsockets.',
    );
    lines.push(`blockExoticSubdeps: ${String(model.blockExoticSubdeps)}`);
  }

  return `${lines.join('\n')}\n`;
}
