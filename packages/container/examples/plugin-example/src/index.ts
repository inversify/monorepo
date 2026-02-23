import { Plugin, type PluginApi } from '@inversifyjs/plugin';
import { type Container } from 'inversify';

export const pluginExample: unique symbol = Symbol.for(
  '@inversifyjs/plugin-example',
);

declare module 'inversify' {
  interface Container {
    [pluginExample](): void;
  }
}

export class PluginExample extends Plugin<Container> {
  public load(api: PluginApi): void {
    api.define(
      pluginExample,
      function (this: PluginExample): void {}.bind(this),
    );
  }
}
