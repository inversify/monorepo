export function buildSetHeaderMetadata(
  headerKey: string,
  value: string,
): (headerMetadata: Map<string, string>) => Map<string, string> {
  return (headerMetadata: Map<string, string>): Map<string, string> => {
    const fixedKey: string = headerKey.toLowerCase();

    const headerValue: string | undefined = headerMetadata.get(fixedKey);

    if (headerValue !== undefined) {
      headerMetadata.set(fixedKey, `${headerValue}, ${value}`);
    } else {
      headerMetadata.set(fixedKey, value);
    }

    return headerMetadata;
  };
}
