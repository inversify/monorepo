import { type CaptureRequestValuesOptions } from '../models/CaptureRequestValuesOptions.js';

export function resolveCaptureRequestValuesOptions(
  options: CaptureRequestValuesOptions,
): CaptureRequestValuesOptions {
  if (options.url !== true) {
    return options;
  }

  /*
   * The raw query string is part of the URL. `_getUrl` rebuilds the URL from
   * `getUrl()` plus `getQuery()`, so capturing the URL always captures query.
   */
  return {
    ...options,
    query: true,
  };
}
