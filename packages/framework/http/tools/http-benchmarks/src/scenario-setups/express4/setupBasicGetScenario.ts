import express, { Application, Request, Response } from 'express4';

import { DEFAULT_PORT } from '../../constant/defaultPort';

async function setUp(): Promise<void> {
  const app: Application = express();

  app.get('/', (_req: Request, res: Response) => {
    res.send('ok');
  });

  app.listen(DEFAULT_PORT);
}

void setUp();
