import { type UriAttributes } from './Uri.js';

export function stringifyAttributes(uriAttributes: UriAttributes): string {
  let stringifiedUri: string = '';

  if (uriAttributes.scheme !== undefined) {
    stringifiedUri += `${uriAttributes.scheme}:`;
  }

  if (uriAttributes.authority !== undefined) {
    stringifiedUri += `//${uriAttributes.authority}`;
  }

  stringifiedUri += uriAttributes.path;

  if (uriAttributes.query !== undefined) {
    stringifiedUri += `?${uriAttributes.query}`;
  }

  if (uriAttributes.fragment !== undefined) {
    stringifiedUri += `#${uriAttributes.fragment}`;
  }

  return stringifiedUri;
}
