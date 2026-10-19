import { injectable } from 'inversify';

import { Builder } from '../../../../foundation/modules/Builder.js';
import { type CompletedExecutionsFindQuery } from '../../../application/models/ExecutionsFindQuery.js';
import { GetInsightsV1Query } from '../schemas/GetInsightsV1Query.js';

@injectable()
export class ExecutionsFindQueryFromGetInsightsV1QueryBuilder implements Builder<
  GetInsightsV1Query,
  CompletedExecutionsFindQuery
> {
  public build(query: GetInsightsV1Query): CompletedExecutionsFindQuery {
    const offset: number = (query.page - 1) * query.pageSize;

    const findQuery: CompletedExecutionsFindQuery = {
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
