import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  Body,
  Controller,
  Get,
  HttpStatusCode,
  Post,
} from '@inversifyjs/http-core';
import {
  OasRequestBody,
  OasResponse,
  ToSchemaFunction,
} from '@inversifyjs/http-open-api';
import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

import { buildExpressServer } from '../../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../../server/models/Server';
import {
  BaseSchema,
  ExtendedSchema,
} from './decoratorApiOasExtendingClassSchemas';

@Controller('/extended-schemas')
export class ExtendedSchemaController {
  @OasRequestBody((toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(ExtendedSchema),
      },
    },
    description: 'Extended schema data',
    required: true,
  }))
  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(ExtendedSchema),
      },
    },
    description: 'The processed extended schema',
  }))
  @Post()
  public async createExtended(
    @Body() data: ExtendedSchema,
  ): Promise<ExtendedSchema> {
    return {
      bar: data.bar,
      count: data.count,
      foo: data.foo,
    };
  }

  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(BaseSchema),
      },
    },
    description: 'The base schema data',
  }))
  @Get('/base')
  public async getBase(): Promise<BaseSchema> {
    return {
      foo: 'example value',
    };
  }
}

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpressServer],
])(
  'Decorator API (OasExtendingClassSchemas)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      container.bind(ExtendedSchemaController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should generate schema definitions for base and extended schemas', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/docs/spec`,
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      );
      const docsSpecResponseBody: OpenApi3Dot1Object =
        (await response.json()) as OpenApi3Dot1Object;

      expect(docsSpecResponseBody.components?.schemas).toBeDefined();
      expect(
        docsSpecResponseBody.components?.schemas?.['BaseSchema'],
      ).toBeDefined();
      expect(
        docsSpecResponseBody.components?.schemas?.['ExtendedSchema'],
      ).toBeDefined();

      // Verify the base schema properties
      const baseSchema: unknown =
        docsSpecResponseBody.components?.schemas?.['BaseSchema'];

      expect(baseSchema).toStrictEqual(
        expect.objectContaining({
          properties: expect.objectContaining({
            foo: expect.objectContaining({
              description: 'A common string property',
              type: 'string',
            }),
          }),
          required: ['foo'],
          type: 'object',
        }),
      );

      // Verify the extended schema inherits from base schema and has additional properties
      const extendedSchema: unknown =
        docsSpecResponseBody.components?.schemas?.['ExtendedSchema'];

      expect(extendedSchema).toStrictEqual(
        expect.objectContaining({
          allOf: [
            expect.objectContaining({
              $ref: '#/components/schemas/BaseSchema',
            }),
          ],
          properties: expect.objectContaining({
            bar: expect.objectContaining({
              description: 'An additional property in the extended schema',
              type: 'string',
            }),
            count: expect.objectContaining({
              description: 'A numeric property in the extended schema',
              minimum: 0,
              type: 'number',
            }),
          }),
          required: ['bar', 'count'],
          type: 'object',
        }),
      );
    });
  },
);
