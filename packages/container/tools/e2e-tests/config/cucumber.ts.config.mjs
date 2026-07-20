import { getBaseConfiguration } from './cucumber.config.base.mjs';

/**
 * @param {boolean} parallel
 * @returns {!import("@cucumber/cucumber/lib/configuration").IConfiguration}
 */
function getConfiguration(parallel) {
  /** @type {!import("@cucumber/cucumber/lib/configuration").IConfiguration} */
  const config = {
    ...getBaseConfiguration(parallel),
    require: [
      // Must run before decorated support code (Cucumber 13.1+ no longer loads it).
      'src/app/setup/reflectMetadata.ts',
      'src/*/parameters/*.ts',
      'src/*/step-definitions/*.ts',
      'src/app/hooks/*.ts',
    ],
    requireModule: ['ts-node/register'],
  };

  return config;
}

/** @type {import("@cucumber/cucumber/lib/configuration").IConfiguration} */
const serial = getConfiguration(false);

/** @type {import("@cucumber/cucumber/lib/configuration").IConfiguration} */
const parallel = getConfiguration(true);

export default serial;

export { serial, parallel };
