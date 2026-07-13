import { asClass } from 'awilix';

import { AwilixBaseScenario } from './AwilixBaseScenario.js';

class Parameter {
  public value() {
    return 'value';
  }
}

class WideService {
  private readonly param1: Parameter;
  private readonly param2: Parameter;
  private readonly param3: Parameter;
  private readonly param4: Parameter;
  private readonly param5: Parameter;
  private readonly param6: Parameter;
  private readonly param7: Parameter;
  private readonly param8: Parameter;
  private readonly param9: Parameter;
  private readonly param10: Parameter;

  constructor({
    param1,
    param2,
    param3,
    param4,
    param5,
    param6,
    param7,
    param8,
    param9,
    param10,
  }: {
    param1: Parameter;
    param2: Parameter;
    param3: Parameter;
    param4: Parameter;
    param5: Parameter;
    param6: Parameter;
    param7: Parameter;
    param8: Parameter;
    param9: Parameter;
    param10: Parameter;
  }) {
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
    this.param4 = param4;
    this.param5 = param5;
    this.param6 = param6;
    this.param7 = param7;
    this.param8 = param8;
    this.param9 = param9;
    this.param10 = param10;
  }

  public run() {
    return [
      this.param1.value(),
      this.param2.value(),
      this.param3.value(),
      this.param4.value(),
      this.param5.value(),
      this.param6.value(),
      this.param7.value(),
      this.param8.value(),
      this.param9.value(),
      this.param10.value(),
    ].join(' ');
  }
}

export class AwilixGetWideServiceInTransientScope extends AwilixBaseScenario {
  public override async setUp(): Promise<void> {
    this._container.register({
      param1: asClass(Parameter).transient(),
      param2: asClass(Parameter).transient(),
      param3: asClass(Parameter).transient(),
      param4: asClass(Parameter).transient(),
      param5: asClass(Parameter).transient(),
      param6: asClass(Parameter).transient(),
      param7: asClass(Parameter).transient(),
      param8: asClass(Parameter).transient(),
      param9: asClass(Parameter).transient(),
      param10: asClass(Parameter).transient(),
      wideService: asClass(WideService).transient(),
    });
  }

  public async execute(): Promise<void> {
    this._container.resolve<WideService>('wideService');
  }

  public override async tearDown(): Promise<void> {
    await this._container.dispose();
  }
}
