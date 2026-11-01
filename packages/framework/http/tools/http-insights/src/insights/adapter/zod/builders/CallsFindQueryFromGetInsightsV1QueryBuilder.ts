import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type CompletedCallsFindQuery } from '../../../application/models/CallsFindQuery.js';
import { type GetCallsV1Query } from '../schemas/GetCallsV1Query.js';

@injectable()
export class CallsFindQueryFromGetInsightsV1QueryBuilder implements Builder<
  GetCallsV1Query,
  CompletedCallsFindQuery
> {
  public build(query: GetCallsV1Query): CompletedCallsFindQuery {
    const offset: number = (query.page - 1) * query.pageSize;

    const findQuery: CompletedCallsFindQuery = {
      filter: {
        id: undefined,
        request: {
          method: query.requestMethod,
          urlLike: query.requestUrlLike,
        },
        response: {
          statusCode: query.responseStatusCode,
        },
        sort: query.sort,
      },
      limit: query.pageSize,
      offset,
    };

    return findQuery;
  }
}
