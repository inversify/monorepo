import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  OpenApi3Dot1Object,
  OpenApi3Dot1OperationObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import { ProductController } from './decoratorApiOasComprehensive';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpressServer],
])(
  'Decorator API (OasComprehensive)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(ProductController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should combine multiple decorators successfully', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/docs/spec`,
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      );
      const docsSpecResponseBody: OpenApi3Dot1Object =
        (await response.json()) as OpenApi3Dot1Object;

      // Check that the OpenAPI spec was generated successfully
      expect(docsSpecResponseBody.paths).toBeDefined();
      expect(docsSpecResponseBody.paths?.['/products']).toBeDefined();
      expect(docsSpecResponseBody.paths?.['/products/:id']).toBeDefined();
      expect(docsSpecResponseBody.paths?.['/products/legacy']).toBeDefined();

      // Check that schemas were generated
      expect(docsSpecResponseBody.components?.schemas).toBeDefined();
      expect(
        docsSpecResponseBody.components?.schemas?.['Product'],
      ).toBeDefined();
      expect(
        docsSpecResponseBody.components?.schemas?.['CreateProductRequest'],
      ).toBeDefined();
      expect(
        docsSpecResponseBody.components?.schemas?.['ErrorResponse'],
      ).toBeDefined();

      // Check that operations have the expected metadata
      const getAllProductsOp: OpenApi3Dot1OperationObject | undefined =
        docsSpecResponseBody.paths?.['/products']?.get;

      expect(getAllProductsOp?.summary).toBe('Get all products');
      expect(getAllProductsOp?.operationId).toBe('getAllProducts');
      expect(getAllProductsOp?.tags).toContain('products');
      expect(getAllProductsOp?.tags).toContain('inventory');
      expect(getAllProductsOp?.deprecated).toBeUndefined();

      const legacyOp: OpenApi3Dot1OperationObject | undefined =
        docsSpecResponseBody.paths?.['/products/legacy']?.get;

      expect(legacyOp?.deprecated).toBe(true);
      expect(legacyOp?.operationId).toBe('getLegacyProduct');
    });
  },
);
