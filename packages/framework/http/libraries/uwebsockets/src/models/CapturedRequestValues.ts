export interface CapturedRequestValues {
  caseSensitiveMethod: string | undefined;
  contentType: string | undefined;
  headers: Record<string, string> | undefined;
  method: string | undefined;
  paramNameList: string[] | undefined;
  params: Record<string, string> | undefined;
  query: string | undefined;
  url: string | undefined;
}
