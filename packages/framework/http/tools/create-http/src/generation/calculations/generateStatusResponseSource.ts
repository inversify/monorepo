export function generateStatusResponseSource(): string {
  return `export interface StatusResponse {
  status: string;
}
`;
}
