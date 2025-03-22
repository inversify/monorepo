import os from 'os';

const cpuCores = os.cpus().length;

/**
 * @param {boolean} parallel
 * @returns {!import("@cucumber/cucumber/lib/configuration").IConfiguration}
 */
function getBaseConfiguration(parallel) {
  /** @type {!import("@cucumber/cucumber/lib/configuration").IConfiguration} */
  const config = {
    paths: ['features/**/*.feature'],
  };

  if (parallel === true) {
    config.parallel = cpuCores;
  }

  return config;
}

export { getBaseConfiguration };
