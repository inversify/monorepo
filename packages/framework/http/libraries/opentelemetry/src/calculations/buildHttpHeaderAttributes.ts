import { type Attributes } from '@opentelemetry/api';

export function buildHttpHeaderAttributes(
  prefix: string,
  headers: Readonly<Record<string, string | readonly string[]>>,
): Attributes {
  const attributes: Attributes = {};

  for (const [name, value] of Object.entries(headers)) {
    attributes[`${prefix}.${name}`] =
      typeof value === 'string' ? value : [...value];
  }

  return attributes;
}
