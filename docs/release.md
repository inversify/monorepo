# Release

Manually releasing all the packages of a monorepo can be as challenging as inappropriate. For such a reason we rely on changesets, GH actions and as less as possible manual steps.

## Requirements

- Privileges to trigger GH actions.
- Proper changesets to be deployed.

## Steps

### Publish npm packages

Run the `publish` GH action. This should generate a PR with version bumps and changelogs updates. After carefully reviewing the PR, merge it and run the `publish` action again. Publishing uses the `NPM_TOKEN` repository secret (exposed to the workflow as `NODE_AUTH_TOKEN` via `actions/setup-node` registry auth) with privileges to publish in the `@inversifyjs` npm org. This should trigger an attempt to publish npm packages and generate github releases.
