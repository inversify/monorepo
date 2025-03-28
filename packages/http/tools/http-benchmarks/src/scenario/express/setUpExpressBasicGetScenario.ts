import express, { Application, Request, Response } from 'express';

async function setUp(): Promise<void> {
  const app: Application = express();

  app.get('/', (_req: Request, res: Response) => {
    res.send('ok');
  });

  app.listen(3000);
}

void setUp();
