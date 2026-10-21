import { beforeAll, describe, expect, it, vitest } from 'vitest';

import { httpInsightsUiBundleDirectory } from '@inversifyjs/http-insights-ui';

import { buildHttpInsightsUiFileResponse } from '../calculations/buildHttpInsightsUiFileResponse.js';
import { InsightsUiController } from './InsightsUiController.js';

vitest.mock(
  import('../calculations/buildHttpInsightsUiFileResponse.js'),
  () => ({
    buildHttpInsightsUiFileResponse: vitest.fn(),
  }),
);

describe(InsightsUiController, () => {
  describe('.getCall', () => {
    describe('when called', () => {
      beforeAll(() => {
        new InsightsUiController().getCall();
      });

      it('should serve the UI index', () => {
        expect(buildHttpInsightsUiFileResponse).toHaveBeenCalledExactlyOnceWith(
          httpInsightsUiBundleDirectory,
          'index.html',
        );
      });
    });
  });
});
