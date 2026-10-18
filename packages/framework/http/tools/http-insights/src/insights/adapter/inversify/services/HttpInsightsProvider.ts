import { type Container } from 'inversify';

import { DbContainerModule } from '../../../../foundation/db/adapter/inversify/modules/DbContainerModule.js';
import { InsightsContainerModule } from '../modules/InsightsContainerModule.js';

export class HttpInsightsProvider {
  public async provide(container: Container): Promise<void> {
    await container.loadAsync(
      new DbContainerModule(),
      new InsightsContainerModule(),
    );
  }
}
