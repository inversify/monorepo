export const GENERATED_API_DIRECTORY_SEGMENTS: readonly string[] = [
  'src',
  'generated',
  'api',
];

export const GENERATED_API_SOURCE_FILE_NAME: string = 'index.ts';

export function buildGeneratedApiSourceRelativePath(): string {
  return [
    ...GENERATED_API_DIRECTORY_SEGMENTS,
    GENERATED_API_SOURCE_FILE_NAME,
  ].join('/');
}
