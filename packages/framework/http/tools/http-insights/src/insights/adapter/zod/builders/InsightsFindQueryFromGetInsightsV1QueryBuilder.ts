import { injectable } from 'inversify';

import { Builder } from '../../../../foundation/modules/Builder.js';
import { InsightsFindQuery } from '../../../application/models/InsightsFindQuery.js';
import { GetInsightsV1Query } from '../schemas/GetInsightsV1Query.js';

@injectable()
export class InsightsFindQueryFromGetInsightsV1QueryBuilder implements Builder<
  GetInsightsV1Query,
  InsightsFindQuery
> {
  public build(query: GetInsightsV1Query): InsightsFindQuery {
    const offset: number = (query.page - 1) * query.pageSize;

    const findQuery: InsightsFindQuery = {
      limit: query.pageSize,
      offset,
      request: {
        method: query.requestMethod,
        urlLike: query.requestUrlLike,
      },
      response: {
        statusCode: query.responseStatusCode,
      },
      sort: query.sort,
    };

    return findQuery;
  }
}
