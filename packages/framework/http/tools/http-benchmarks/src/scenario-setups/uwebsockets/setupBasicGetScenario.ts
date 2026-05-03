import { App, HttpResponse, TemplatedApp } from 'uWebSockets.js';

import { DEFAULT_PORT } from '../../constant/defaultPort';

async function setUp(): Promise<void> {
  const app: TemplatedApp = App();

  app.get('/', (res: HttpResponse) => {
    res.cork(() => {
      res.writeStatus('200 OK').end('ok');
    });
  });

  app.listen('0.0.0.0', DEFAULT_PORT, () => undefined);
}

void setUp();
