export function pickCatalogVersions(
  catalogSection: Record<string, string>,
  packageNames: readonly string[],
): Record<string, string> {
  const selectedDependencies: Record<string, string> = {};

  for (const packageName of packageNames) {
    const version: string | undefined = catalogSection[packageName];

    if (version === undefined) {
      throw new Error(`Missing dependency catalog entry for "${packageName}".`);
    }

    selectedDependencies[packageName] = version;
  }

  return selectedDependencies;
}

export function mergeDependencyRecords(
  ...dependencyRecords: readonly Record<string, string>[]
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(
      dependencyRecords.reduce<Record<string, string>>(
        (
          mergedDependencies: Record<string, string>,
          dependencyRecord: Record<string, string>,
        ) => ({
          ...mergedDependencies,
          ...dependencyRecord,
        }),
        {},
      ),
    ).sort(
      (
        [leftPackageName]: [string, string],
        [rightPackageName]: [string, string],
      ) => leftPackageName.localeCompare(rightPackageName),
    ),
  );
}
