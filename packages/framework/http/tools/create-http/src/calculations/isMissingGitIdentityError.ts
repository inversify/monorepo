export function isMissingGitIdentityError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes('Author identity unknown') ||
    error.message.includes('empty ident name')
  );
}
