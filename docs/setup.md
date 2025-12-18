# Setup

Welcome aboard! In this doc you will be provided with all the relevant knowledge to set up the monorepo packages.

## Requirements

A few software tools are required to set develop environment:

- NodeJS 24. (we strongly suggest using [nvm](https://github.com/nvm-sh/nvm)).
- [pnpm](https://pnpm.io/) is used as package manager, so be sure you have it globally installed.

## Steps to set up the monorepo

1. Clone this repo

```
git clone https://github.com/inversify/monorepo.git inversify-monorepo
```

2. Go to the root package

```
cd inversify-monorepo
```

3. Install dependencies

```
pnpm i
```

4. Build project

```
pnpm run build
```

Now you're all set. Enjoy coding!
