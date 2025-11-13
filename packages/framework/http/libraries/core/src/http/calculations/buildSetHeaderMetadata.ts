import { concatenateHeaders } from './concatenateHeaders';

export function buildSetHeaderMetadata(
  headerKey: string,
  value: string,
): (headerMetadata: Record<string, string>) => Record<string, string> {
  return (headerMetadata: Record<string, string>): Record<string, string> => {
    const headerName: string = headerKey.toLowerCase();

    const headerValue: string | undefined = headerMetadata[headerName];
    if (headerValue === undefined) {
      headerMetadata[headerName] = value;
    } else {
      headerMetadata[headerName] = concatenateHeaders(
        headerName,
        headerValue,
        value,
      );
    }

    return headerMetadata;
  };
}
