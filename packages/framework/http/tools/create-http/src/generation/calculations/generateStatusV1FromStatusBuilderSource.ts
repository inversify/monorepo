export function generateStatusV1FromStatusBuilderSource(): string {
  return `import { injectable } from 'inversify';

import { type Builder } from '../../../common/domain/modules/Builder.js';
import { type Status } from '../../domain/models/Status.js';
import { type StatusV1 } from '../models/StatusV1.js';

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
