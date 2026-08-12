export interface CapturedRequestValues {
  caseSensitiveMethod: string | undefined;
  headers: Record<string, string> | undefined;
  method: string | undefined;
  paramNameList: string[] | undefined;
  params: Record<string, string | undefined> | undefined;
  query: string | undefined;
  url: string | undefined;
}
