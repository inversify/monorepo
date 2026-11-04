import { type HttpInsightsProviderOptions } from '../../../../insights/adapter/inversify/models/HttpInsightsProviderOptions.js';

export const DEFAULT_HTTP_INSIGHTS_URL_PATTERN: RegExp =
  /^(?!\/?\.inversify(?:[/?#]|$)).*$/u;

export function buildHttpInsightsUrlPattern(
  options: HttpInsightsProviderOptions | undefined,
): RegExp {
  return readStatelessUrlPattern(
    options?.url?.pattern ?? DEFAULT_HTTP_INSIGHTS_URL_PATTERN,
  );
}

function readStatelessUrlPattern(pattern: RegExp): RegExp {
  if (!pattern.global && !pattern.sticky) {
    return pattern;
  }

  return new RegExp(pattern.source, pattern.flags.replaceAll(/[gy]/gu, ''));
}
