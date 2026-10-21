import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type CompletedExecutionsFindQuery } from '../../../application/models/ExecutionsFindQuery.js';

@injectable()
export class ExecutionsFindQueryFromInsightsIdBuilder implements Builder<
  string,
  CompletedExecutionsFindQuery
> {
  public build(insightsId: string): CompletedExecutionsFindQuery {
    const findQuery: CompletedExecutionsFindQuery = {
      filter: {
        id: insightsId,
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
