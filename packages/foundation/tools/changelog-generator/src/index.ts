import {
  ChangelogFunctions,
  ModCompWithPackage,
  NewChangesetWithCommit,
  VersionType,
} from '@changesets/types';

async function getReleaseLine(
  changeset: NewChangesetWithCommit,
  _type: VersionType,
): Promise<string> {
  return changeset.summary;
}

async function getDependencyReleaseLine(
  _changesets: NewChangesetWithCommit[],
  dependenciesUpdated: ModCompWithPackage[],
): Promise<string> {
  if (dependenciesUpdated.length === 0) return '';

  const changesetLinks: string = '- Updated dependencies';

  const updatedDependenciesList: string[] = dependenciesUpdated.map(
    (dependency: ModCompWithPackage) =>
      `  - ${dependency.name}@${dependency.newVersion}`,
  );

  return [changesetLinks, ...updatedDependenciesList].join('\n');
}

const defaultChangelogFunctions: ChangelogFunctions = {
  getDependencyReleaseLine,
  getReleaseLine,
};

export default defaultChangelogFunctions;
