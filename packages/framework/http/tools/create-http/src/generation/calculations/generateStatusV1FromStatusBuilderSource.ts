import { ApiStyle } from '../../models/ApiStyle.js';

export function generateStatusV1FromStatusBuilderSource(
  apiStyle: ApiStyle,
): string {
  const statusV1Import: string =
    apiStyle === ApiStyle.schemaFirst
      ? "import { type StatusV1 } from '../../../generated/api/index.js';"
      : "import { type StatusV1 } from '../models/StatusV1.js';";

  return `import { injectable } from 'inversify';

import { type Builder } from '../../../common/domain/modules/Builder.js';
import { type Status } from '../../domain/models/Status.js';
${statusV1Import}

@injectable()
export class StatusV1FromStatusBuilder implements Builder<Status, StatusV1> {
  public build(input: Status): StatusV1 {
    return {
      status: input.status,
    };
  }
}
`;
}
