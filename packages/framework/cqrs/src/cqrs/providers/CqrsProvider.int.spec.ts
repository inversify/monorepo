import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { Container } from 'inversify';

import { commandHandlerMetadataReflectKey } from '../../reflectMetadata/data/commandHandlerMetadataReflectKey.js';
import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { eventHandlerMetadataReflectKey } from '../../reflectMetadata/data/eventHandlerMetadataReflectKey.js';
import { eventMetadataReflectKey } from '../../reflectMetadata/data/eventMetadataReflectKey.js';
import { queryHandlerMetadataReflectKey } from '../../reflectMetadata/data/queryHandlerMetadataReflectKey.js';
import { queryMetadataReflectKey } from '../../reflectMetadata/data/queryMetadataReflectKey.js';
import { Command } from '../decorators/Command.js';
import { CommandHandler } from '../decorators/CommandHandler.js';
import { Event } from '../decorators/Event.js';
import { EventHandler } from '../decorators/EventHandler.js';
import { Query } from '../decorators/Query.js';
import { QueryHandler } from '../decorators/QueryHandler.js';
import { type CqrsCommandHandler } from '../models/CqrsCommandHandler.js';
import { type CqrsEventHandler } from '../models/CqrsEventHandler.js';
import { type CqrsQueryHandler } from '../models/CqrsQueryHandler.js';
import { SyncTransportDeclaration } from '../transports/SyncTransportDeclaration.js';
import { CqrsProvider } from './CqrsProvider.js';

const events: string[] = [];
const published: string[] = [];

const stockReserved: {
  gate: Promise<void>;
  release: () => void;
} = {
  gate: Promise.resolve(),
  release: () => {},
};

async function waitForEventHandlers(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

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

@Event({
  identifier: 'stock.reserved',
})
class StockReserved {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

@Event({
  identifier: 'stock.reserved',
})
class DuplicateStockReserved {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

@Event({
  identifier: 'stock.depleted',
})
class StockDepleted {
  public readonly sku: string;

  constructor(sku: string) {
    this.sku = sku;
  }
}

class StockUnknown {}

@EventHandler({
  event: StockDepleted,
})
class FailStockDepletedHandler implements CqrsEventHandler<StockDepleted> {
  public handle(): void {
    throw new Error('audit log failed');
  }
}

@EventHandler({
  event: StockDepleted,
})
class RecordStockDepletedHandler implements CqrsEventHandler<StockDepleted> {
  public handle(event: StockDepleted): void {
    published.push(`record:${event.sku}`);
  }
}

@EventHandler({
  event: StockReserved,
})
class NotifyStockReservedHandler implements CqrsEventHandler<StockReserved> {
  public async handle(event: StockReserved): Promise<void> {
    published.push(`start:${event.sku}`);

    await stockReserved.gate;

    published.push(`end:${event.sku}`);
  }
}

@EventHandler({
  event: StockReserved,
})
class AuditStockReservedHandler implements CqrsEventHandler<StockReserved> {
  public handle(event: StockReserved): void {
    published.push(`audit:${event.sku}`);
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
    Reflect.deleteMetadata(eventHandlerMetadataReflectKey, Reflect);
    Reflect.deleteMetadata(eventMetadataReflectKey, StockReserved);
    Reflect.deleteMetadata(eventMetadataReflectKey, DuplicateStockReserved);
    Reflect.deleteMetadata(eventMetadataReflectKey, StockDepleted);
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

  describe('.getEventBus', () => {
    describe('.send', () => {
      describe('having handlers for the event', () => {
        let provider: CqrsProvider;

        beforeAll(async () => {
          const container: Container = new Container();

          container.bind(NotifyStockReservedHandler).toSelf();
          container.bind(AuditStockReservedHandler).toSelf();
          container.bind(FailStockDepletedHandler).toSelf();
          container.bind(RecordStockDepletedHandler).toSelf();

          provider = new CqrsProvider();

          await provider.provide(container);
        });

        describe('when called', () => {
          beforeAll(async () => {
            published.length = 0;
            stockReserved.gate = new Promise<void>((resolve: () => void) => {
              stockReserved.release = resolve;
            });

            provider.getEventBus().send(new StockReserved('sku-1'));

            await waitForEventHandlers();
          });

          afterAll(async () => {
            stockReserved.release();
            stockReserved.gate = Promise.resolve();

            await waitForEventHandlers();
          });

          it('should return before the handler settles', () => {
            expect(published).toStrictEqual(['start:sku-1', 'audit:sku-1']);
          });

          describe('when the handler settles', () => {
            beforeAll(async () => {
              stockReserved.release();

              await waitForEventHandlers();
            });

            it('should finish the handler', () => {
              expect(published).toStrictEqual([
                'start:sku-1',
                'audit:sku-1',
                'end:sku-1',
              ]);
            });
          });
        });

        describe('when called, and the event class is different and has the same identifier', () => {
          beforeAll(async () => {
            published.length = 0;
            stockReserved.gate = Promise.resolve();

            provider.getEventBus().send(new DuplicateStockReserved('sku-2'));

            await waitForEventHandlers();
          });

          it('should run the handlers', () => {
            expect(published).toStrictEqual([
              'start:sku-2',
              'audit:sku-2',
              'end:sku-2',
            ]);
          });
        });

        describe('when called, and no handler is registered for the event', () => {
          let errorFixture: unknown;

          beforeAll(() => {
            try {
              provider.getEventBus().send(new StockUnknown());
            } catch (error: unknown) {
              errorFixture = error;
            }
          });

          it('should throw an Error', () => {
            expect(errorFixture).toBeInstanceOf(Error);
            expect((errorFixture as Error).message).toBe(
              'No handler found for event StockUnknown',
            );
          });
        });

        describe('when called, and a handler throws', () => {
          beforeAll(async () => {
            published.length = 0;

            provider.getEventBus().send(new StockDepleted('sku-3'));

            await waitForEventHandlers();
          });

          it('should run the other handler', () => {
            expect(published).toStrictEqual(['record:sku-3']);
          });
        });
      });
    });
  });
});
