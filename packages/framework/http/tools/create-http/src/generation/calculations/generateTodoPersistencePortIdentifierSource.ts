export function generateTodoPersistencePortIdentifierSource(): string {
  return `export const todoPersistencePortIdentifier: symbol = Symbol.for(
  'TodoPersistencePort',
);
`;
}
