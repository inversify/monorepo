import { describe, expectTypeOf, it } from 'vitest';

import rhea, {
  type ConnectionOptions,
  type Container,
  type Message,
  type ReceiverOptions,
  type SenderOptions,
} from 'rhea';

describe('rhea API', () => {
  it('should expose create_container() on the default import', () => {
    expectTypeOf(rhea.create_container).returns.toEqualTypeOf<Container>();
  });

  it('should expose generate_uuid() on the default import', () => {
    expectTypeOf(rhea.generate_uuid).returns.toEqualTypeOf<string>();
  });

  it('should expose message.data_section() on the default import', () => {
    expectTypeOf(rhea.message.data_section).toBeFunction();
  });

  it('should expose message.data_sections() on the default import', () => {
    expectTypeOf(rhea.message.data_sections).toBeFunction();
  });

  it('should expose message.sequence_sections() on the default import', () => {
    expectTypeOf(rhea.message.sequence_sections).toBeFunction();
  });

  it('should expose the connection, link and message types', () => {
    expectTypeOf<ConnectionOptions>().toHaveProperty('reconnect');
    expectTypeOf<ReceiverOptions>().toHaveProperty('autoaccept');
    expectTypeOf<SenderOptions>().toHaveProperty('target');
    expectTypeOf<Message>().toHaveProperty('body');
  });
});
