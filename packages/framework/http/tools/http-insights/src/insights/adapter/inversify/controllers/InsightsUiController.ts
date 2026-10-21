import { join } from 'node:path';

import {
  Controller,
  Get,
  type HttpResponse,
  Params,
} from '@inversifyjs/http-core';
import {
  httpInsightsUiBundleDirectory,
  httpInsightsUiPath,
} from '@inversifyjs/http-insights-ui';

import { buildHttpInsightsUiFileResponse } from '../calculations/buildHttpInsightsUiFileResponse.js';

const HTTP_INSIGHTS_UI_ASSET_DIRECTORY: string = 'assets';

@Controller(httpInsightsUiPath)
export class InsightsUiController {
  @Get()
  public getIndex(): HttpResponse {
    return buildHttpInsightsUiFileResponse(
      httpInsightsUiBundleDirectory,
      'index.html',
    );
  }

  @Get('/executions/:executionId')
  public getExecution(): HttpResponse {
    return this.getIndex();
  }

  @Get(`/${HTTP_INSIGHTS_UI_ASSET_DIRECTORY}/:resource`)
  public getAsset(
    @Params({
      name: 'resource',
    })
    resource: string,
  ): HttpResponse {
    return buildHttpInsightsUiFileResponse(
      httpInsightsUiBundleDirectory,
      join(HTTP_INSIGHTS_UI_ASSET_DIRECTORY, resource),
    );
  }
}
