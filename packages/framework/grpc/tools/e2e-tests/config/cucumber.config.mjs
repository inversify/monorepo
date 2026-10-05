import os from 'node:os';

const cpuCores = os.cpus().length;

/**
 * @param {boolean} parallel
 * @returns {!import("@cucumber/cucumber/lib/configuration").IConfiguration}
 */
function getConfiguration(parallel) {
  /** @type {!import("@cucumber/cucumber/lib/configuration").IConfiguration} */
  const config = {
    import: [
      'lib/app/setup/reflectMetadata.js',
      'lib/**/step-definitions/*.js',
      'lib/app/hooks/*.js',
    ],
    paths: ['features/**/*.feature'],
  };

  if (parallel === true) {
    config.parallel = cpuCores;
  }

  return config;
}

/** @type {import("@cucumber/cucumber/lib/configuration").IConfiguration} */
const serial = getConfiguration(false);

/** @type {import("@cucumber/cucumber/lib/configuration").IConfiguration} */
const parallel = getConfiguration(true);

export default serial;

export { parallel, serial };
