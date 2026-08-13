export function generateLoggerFactoryIdentifierSource(): string {
  return `export const loggerFactoryIdentifier: symbol = Symbol.for('Factory<Logger>');
`;
}
