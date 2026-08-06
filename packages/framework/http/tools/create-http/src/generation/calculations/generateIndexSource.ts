export function generateIndexSource(): string {
  return `import { bootstrap } from './app/scripts/bootstrap.js';

await bootstrap();
`;
}
