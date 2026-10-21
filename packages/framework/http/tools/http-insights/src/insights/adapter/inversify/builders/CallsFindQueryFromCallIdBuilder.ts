import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type CompletedCallsFindQuery } from '../../../application/models/CallsFindQuery.js';

@injectable()
export class CallsFindQueryFromCallIdBuilder implements Builder<
  string,
  CompletedCallsFindQuery
> {
  public build(callId: string): CompletedCallsFindQuery {
    const findQuery: CompletedCallsFindQuery = {
      filter: {
        id: callId,
        request: {
          method: undefined,
          urlLike: undefined,
        },
        response: {
          statusCode: undefined,
        },
        sort: undefined,
      },
      limit: 1,
      offset: undefined,
    };

    return findQuery;
  }
}
