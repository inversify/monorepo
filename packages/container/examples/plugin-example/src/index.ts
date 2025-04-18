import { Container } from '@inversifyjs/container';
import { Plugin, PluginApi } from '@inversifyjs/plugin';
import {} from 'inversify';

export const pluginExample: unique symbol = Symbol.for(
  '@inversifyjs/plugin-example',
);

declare module 'inversify' {
  interface Container {
    [pluginExample](): void;
  }
}

declare module '@inversifyjs/container' {
  interface Container {
    [pluginExample](): void;
  }
}

export class PluginExample extends Plugin<Container> {
  public load(api: PluginApi<Container>): void {
    api.define(pluginExample, function (this: Container): void {});
  }
}
