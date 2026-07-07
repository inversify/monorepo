import { asClass } from 'awilix';

import { AwilixBaseScenario } from './AwilixBaseScenario.js';

class FinalNode {
  public log() {
    return 'log!';
  }
}

class Node10 {
  private readonly node1: FinalNode;
  private readonly node2: FinalNode;

  constructor({
    finalNode1,
    finalNode2,
  }: {
    finalNode1: FinalNode;
    finalNode2: FinalNode;
  }) {
    this.node1 = finalNode1;
    this.node2 = finalNode2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node9 {
  private readonly node1: Node10;
  private readonly node2: Node10;

  constructor({ node101, node102 }: { node101: Node10; node102: Node10 }) {
    this.node1 = node101;
    this.node2 = node102;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node8 {
  private readonly node1: Node9;
  private readonly node2: Node9;

  constructor({ node91, node92 }: { node91: Node9; node92: Node9 }) {
    this.node1 = node91;
    this.node2 = node92;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node7 {
  private readonly node1: Node8;
  private readonly node2: Node8;

  constructor({ node81, node82 }: { node81: Node8; node82: Node8 }) {
    this.node1 = node81;
    this.node2 = node82;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node6 {
  private readonly node1: Node7;
  private readonly node2: Node7;

  constructor({ node71, node72 }: { node71: Node7; node72: Node7 }) {
    this.node1 = node71;
    this.node2 = node72;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node5 {
  private readonly node1: Node6;
  private readonly node2: Node6;

  constructor({ node61, node62 }: { node61: Node6; node62: Node6 }) {
    this.node1 = node61;
    this.node2 = node62;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node4 {
  private readonly node1: Node5;
  private readonly node2: Node5;

  constructor({ node51, node52 }: { node51: Node5; node52: Node5 }) {
    this.node1 = node51;
    this.node2 = node52;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node3 {
  private readonly node1: Node4;
  private readonly node2: Node4;

  constructor({ node41, node42 }: { node41: Node4; node42: Node4 }) {
    this.node1 = node41;
    this.node2 = node42;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node2 {
  private readonly node1: Node3;
  private readonly node2: Node3;

  constructor({ node31, node32 }: { node31: Node3; node32: Node3 }) {
    this.node1 = node31;
    this.node2 = node32;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node1 {
  private readonly node1: Node2;
  private readonly node2: Node2;

  constructor({ node21, node22 }: { node21: Node2; node22: Node2 }) {
    this.node1 = node21;
    this.node2 = node22;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

export class AwilixGetComplexServiceInTransientScope extends AwilixBaseScenario {
  public override async setUp(): Promise<void> {
    this._container.register({
      finalNode1: asClass(FinalNode).transient(),
      finalNode2: asClass(FinalNode).transient(),
      node1: asClass(Node1).transient(),
      node21: asClass(Node2).transient(),
      node22: asClass(Node2).transient(),
      node31: asClass(Node3).transient(),
      node32: asClass(Node3).transient(),
      node41: asClass(Node4).transient(),
      node42: asClass(Node4).transient(),
      node51: asClass(Node5).transient(),
      node52: asClass(Node5).transient(),
      node61: asClass(Node6).transient(),
      node62: asClass(Node6).transient(),
      node71: asClass(Node7).transient(),
      node72: asClass(Node7).transient(),
      node81: asClass(Node8).transient(),
      node82: asClass(Node8).transient(),
      node91: asClass(Node9).transient(),
      node92: asClass(Node9).transient(),
      node101: asClass(Node10).transient(),
      node102: asClass(Node10).transient(),
    });
  }

  public async execute(): Promise<void> {
    this._container.resolve<Node1>('node1');
  }

  public override async tearDown(): Promise<void> {
    await this._container.dispose();
  }
}
