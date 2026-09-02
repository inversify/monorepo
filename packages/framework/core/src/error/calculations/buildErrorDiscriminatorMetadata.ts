export function buildErrorDiscriminatorMetadata(
  discriminator: string | symbol,
): (discriminators: (string | symbol)[]) => (string | symbol)[] {
  return (discriminators: (string | symbol)[]): (string | symbol)[] => {
    if (discriminators.includes(discriminator)) {
      return [...discriminators];
    }

    return [discriminator, ...discriminators];
  };
}
