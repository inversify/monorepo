import { type HttpAdapter } from '../../models/HttpAdapter.js';
import { type SourceImport } from './BootstrapSourceModel.js';

export interface HttpAdapterBootstrapSpec {
  adapterClassName: string;
  adapterModuleSpecifier: string;
  adapterOptionsObjectLiteral: string;
  applicationType?: string;
  extraImports?: readonly SourceImport[];
  listenStatements: readonly string[];
}

export const HTTP_ADAPTER_BOOTSTRAP_SPECS: Record<
  HttpAdapter,
  HttpAdapterBootstrapSpec
> = {
  express: {
    adapterClassName: 'InversifyExpressHttpAdapter',
    adapterModuleSpecifier: '@inversifyjs/http-express',
    adapterOptionsObjectLiteral: '{ logger: true, useJson: true }',
    applicationType: 'express.Application',
    extraImports: [
      {
        defaultImport: 'express',
        isTypeOnly: true,
        moduleSpecifier: 'express',
      },
    ],
    listenStatements: [
      `app.listen(PORT, () => {
  console.log(\`Server listening on http://localhost:\${String(PORT)}\`);
});`,
    ],
  },
  fastify: {
    adapterClassName: 'InversifyFastifyHttpAdapter',
    adapterModuleSpecifier: '@inversifyjs/http-fastify',
    adapterOptionsObjectLiteral: '{ logger: true }',
    applicationType: 'FastifyInstance',
    extraImports: [
      {
        moduleSpecifier: 'fastify',
        namedImports: [
          {
            isTypeOnly: true,
            name: 'FastifyInstance',
          },
        ],
      },
    ],
    listenStatements: [
      "await app.listen({ host: '0.0.0.0', port: PORT });",
      'console.log(`Server listening on http://localhost:${String(PORT)}`);',
    ],
  },
  hono: {
    adapterClassName: 'InversifyHonoHttpAdapter',
    adapterModuleSpecifier: '@inversifyjs/http-hono',
    adapterOptionsObjectLiteral: '{ logger: true }',
    applicationType: 'Hono',
    extraImports: [
      {
        moduleSpecifier: '@hono/node-server',
        namedImports: [{ name: 'serve' }],
      },
      {
        moduleSpecifier: 'hono',
        namedImports: [
          {
            isTypeOnly: true,
            name: 'Hono',
          },
        ],
      },
    ],
    listenStatements: [
      `serve({
  fetch: app.fetch,
  port: PORT,
});`,
      'console.log(`Server listening on http://localhost:${String(PORT)}`);',
    ],
  },
  uwebsockets: {
    adapterClassName: 'InversifyUwebSocketsHttpAdapter',
    adapterModuleSpecifier: '@inversifyjs/http-uwebsockets',
    adapterOptionsObjectLiteral: '{ logger: true }',
    listenStatements: [
      `app.listen('0.0.0.0', PORT, (socket) => {
  if (socket !== false) {
    console.log(\`Server listening on http://localhost:\${String(PORT)}\`);
  } else {
    console.error('Failed to start server');
  }
});`,
    ],
  },
};
