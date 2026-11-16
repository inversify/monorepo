import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { Container } from 'inversify';

import { commandHandlerMetadataReflectKey } from '../../reflectMetadata/data/commandHandlerMetadataReflectKey.js';
import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { queryHandlerMetadataReflectKey } from '../../reflectMetadata/data/queryHandlerMetadataReflectKey.js';
import { queryMetadataReflectKey } from '../../reflectMetadata/data/queryMetadataReflectKey.js';
import { Command } from '../decorators/Command.js';
import { CommandHandler } from '../decorators/CommandHandler.js';
import { Query } from '../decorators/Query.js';
import { QueryHandler } from '../decorators/QueryHandler.js';
import { type CqrsCommandHandler } from '../models/CqrsCommandHandler.js';
import { type CqrsQueryHandler } from '../models/CqrsQueryHandler.js';
import { SyncTransportDeclaration } from '../transports/SyncTransportDeclaration.js';
import { CqrsProvider } from './CqrsProvider.js';

const events: string[] = [];

@Command({
  identifier: 'stock.reserve',
})
class ReserveStock {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

@Command({
  identifier: 'stock.reserve',
})
class DuplicateReserveStock {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

@Query({
  identifier: 'stock.get',
})
class GetStock {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

@Query({
  identifier: 'stock.get',
})
class DuplicateGetStock {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

@QueryHandler({
  query: GetStock,
})
class GetStockHandler implements CqrsQueryHandler<GetStock, string> {
  public async handle(query: GetStock): Promise<string> {
    await Promise.resolve();

    return `stock:${query.sku}`;
  }
}

@CommandHandler({
  command: ReserveStock,
  transports: [new SyncTransportDeclaration()],
})
class ReserveStockHandler implements CqrsCommandHandler<ReserveStock> {
  public async handle(command: ReserveStock): Promise<void> {
    events.push(`start:${command.sku}`);

    await Promise.resolve();

    events.push(`end:${command.sku}`);
  }
}

describe(CqrsProvider, () => {
  afterAll(() => {
    Reflect.deleteMetadata(commandHandlerMetadataReflectKey, Reflect);
    Reflect.deleteMetadata(commandMetadataReflectKey, ReserveStock);
    Reflect.deleteMetadata(commandMetadataReflectKey, DuplicateReserveStock);
    Reflect.deleteMetadata(queryHandlerMetadataReflectKey, Reflect);
    Reflect.deleteMetadata(queryMetadataReflectKey, GetStock);
    Reflect.deleteMetadata(queryMetadataReflectKey, DuplicateGetStock);
  });

  describe('.getCommandBus', () => {
    describe('.send', () => {
      describe('having a handler bound for the sync transport', () => {
        let provider: CqrsProvider;

        beforeAll(async () => {
          events.length = 0;

          const container: Container = new Container();

          container.bind(ReserveStockHandler).toSelf();

          provider = new CqrsProvider();

          await provider.provide(container);
        });

        describe('when called', () => {
          beforeAll(async () => {
            events.length = 0;

            await provider.getCommandBus().send(new ReserveStock('sku-1'));
          });

          it('should await the handler', () => {
            expect(events).toStrictEqual(['start:sku-1', 'end:sku-1']);
          });
        });

        describe('when called, and the command class is different and has the same identifier', () => {
          beforeAll(async () => {
            events.length = 0;

            await provider
              .getCommandBus()
              .send(new DuplicateReserveStock('sku-2'));
          });

          it('should await the handler', () => {
            expect(events).toStrictEqual(['start:sku-2', 'end:sku-2']);
          });
        });
      });
    });
  });

  describe('.getQueryBus', () => {
    describe('.send', () => {
      describe('having a handler for the query', () => {
        let provider: CqrsProvider;

        beforeAll(async () => {
          const container: Container = new Container();

          container.bind(GetStockHandler).toSelf();

          provider = new CqrsProvider();

          await provider.provide(container);
        });

        describe('when called', () => {
          let result: unknown;

          beforeAll(async () => {
            result = await provider.getQueryBus().send(new GetStock('sku-1'));
          });

          it('should return the handler result', () => {
            expect(result).toBe('stock:sku-1');
          });
        });

        describe('when called, and the query class is different and has the same identifier', () => {
          let result: unknown;

          beforeAll(async () => {
            result = await provider
              .getQueryBus()
              .send(new DuplicateGetStock('sku-2'));
          });

          it('should return the handler result', () => {
            expect(result).toBe('stock:sku-2');
          });
        });
      });
    });
  });
});
