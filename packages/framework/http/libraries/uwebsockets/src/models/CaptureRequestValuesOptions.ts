export interface CaptureRequestValuesOptions {
  headers?: boolean;
  method?: boolean;
  params?: false | string[];
  /**
   * Capture the raw query string. Implied when `url` is `true`, because the
   * adapter rebuilds the URL from `getUrl()` plus `getQuery()`.
   */
  query?: boolean;
  /**
   * Capture the URL. Also captures the query string, which is required to
   * compose the full URL.
   */
  url?: boolean;
}
