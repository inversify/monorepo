import { injectable } from 'inversify6';

import { Inversify6BaseScenario } from './Inversify6BaseScenario.js';

@injectable()
class Parameter {
  public value() {
    return 'value';
  }
}

@injectable()
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

  constructor(
    param1: Parameter,
    param2: Parameter,
    param3: Parameter,
    param4: Parameter,
    param5: Parameter,
    param6: Parameter,
    param7: Parameter,
    param8: Parameter,
    param9: Parameter,
    param10: Parameter,
  ) {
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

export class Inversify6GetWideServiceInTransientScope extends Inversify6BaseScenario {
  public override async setUp(): Promise<void> {
    this._container.bind(Parameter).toSelf().inTransientScope();
    this._container.bind(WideService).toSelf().inTransientScope();
  }

  public async execute(): Promise<void> {
    this._container.get(WideService);
  }

  public override async tearDown(): Promise<void> {
    this._container.unbindAll();
  }
}
