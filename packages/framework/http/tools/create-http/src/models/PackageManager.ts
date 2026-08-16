export enum PackageManager {
  npm = 'npm',
  pnpm = 'pnpm',
  yarn = 'yarn',
}

export const PACKAGE_MANAGERS: readonly PackageManager[] = [
  PackageManager.npm,
  PackageManager.pnpm,
  PackageManager.yarn,
];
