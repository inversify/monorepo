import express, { Application, Request, Response } from 'express';

import { DEFAULT_PORT } from '../../constant/defaultPort';

async function setUp(): Promise<void> {
  const app: Application = express();

  app.get('/', async (_req: Request, res: Response) => {
    res.send('ok');
  });

  app.listen(DEFAULT_PORT);
}

void setUp();
