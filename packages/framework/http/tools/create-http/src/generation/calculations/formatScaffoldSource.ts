import { format } from 'oxfmt';

import { SCAFFOLD_OXFMT_OPTIONS } from '../models/scaffoldOxfmtOptions.js';

export async function formatScaffoldSource(
  fileName: string,
  sourceText: string,
): Promise<string> {
  const formatResult: Awaited<ReturnType<typeof format>> = await format(
    fileName,
    sourceText,
    SCAFFOLD_OXFMT_OPTIONS,
  );

  if (formatResult.errors.length > 0) {
    const errorMessage: string = formatResult.errors
      .map((formatError: { message: string }): string => formatError.message)
      .join('\n');

    throw new Error(`Failed to format "${fileName}":\n${errorMessage}`);
  }

  return formatResult.code;
}
