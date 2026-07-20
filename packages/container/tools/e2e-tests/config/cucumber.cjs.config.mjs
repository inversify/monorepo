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
      'lib/cjs/app/setup/reflectMetadata.js',
      'lib/cjs/*/parameters/*.js',
      'lib/cjs/*/step-definitions/*.js',
      'lib/cjs/app/hooks/*.js',
    ],
  };

  return config;
}

/** @type {import("@cucumber/cucumber/lib/configuration").IConfiguration} */
const serial = getConfiguration(false);

/** @type {import("@cucumber/cucumber/lib/configuration").IConfiguration} */
const parallel = getConfiguration(true);

export default serial;

export { parallel, serial };
