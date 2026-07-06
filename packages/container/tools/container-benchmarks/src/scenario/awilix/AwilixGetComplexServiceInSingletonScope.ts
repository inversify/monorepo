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

  constructor({ finalNode }: { finalNode: FinalNode }) {
    this.node1 = finalNode;
    this.node2 = finalNode;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node9 {
  private readonly node1: Node10;
  private readonly node2: Node10;

  constructor({ node10 }: { node10: Node10 }) {
    this.node1 = node10;
    this.node2 = node10;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node8 {
  private readonly node1: Node9;
  private readonly node2: Node9;

  constructor({ node9 }: { node9: Node9 }) {
    this.node1 = node9;
    this.node2 = node9;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node7 {
  private readonly node1: Node8;
  private readonly node2: Node8;

  constructor({ node8 }: { node8: Node8 }) {
    this.node1 = node8;
    this.node2 = node8;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node6 {
  private readonly node1: Node7;
  private readonly node2: Node7;

  constructor({ node7 }: { node7: Node7 }) {
    this.node1 = node7;
    this.node2 = node7;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node5 {
  private readonly node1: Node6;
  private readonly node2: Node6;

  constructor({ node6 }: { node6: Node6 }) {
    this.node1 = node6;
    this.node2 = node6;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node4 {
  private readonly node1: Node5;
  private readonly node2: Node5;

  constructor({ node5 }: { node5: Node5 }) {
    this.node1 = node5;
    this.node2 = node5;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node3 {
  private readonly node1: Node4;
  private readonly node2: Node4;

  constructor({ node4 }: { node4: Node4 }) {
    this.node1 = node4;
    this.node2 = node4;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node2 {
  private readonly node1: Node3;
  private readonly node2: Node3;

  constructor({ node3 }: { node3: Node3 }) {
    this.node1 = node3;
    this.node2 = node3;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

class Node1 {
  private readonly node1: Node2;
  private readonly node2: Node2;

  constructor({ node2 }: { node2: Node2 }) {
    this.node1 = node2;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

export class AwilixGetComplexServiceInSingletonScope extends AwilixBaseScenario {
  public override async setUp(): Promise<void> {
    this._container.register({
      finalNode: asClass(FinalNode).singleton(),
      node1: asClass(Node1).singleton(),
      node2: asClass(Node2).singleton(),
      node3: asClass(Node3).singleton(),
      node4: asClass(Node4).singleton(),
      node5: asClass(Node5).singleton(),
      node6: asClass(Node6).singleton(),
      node7: asClass(Node7).singleton(),
      node8: asClass(Node8).singleton(),
      node9: asClass(Node9).singleton(),
      node10: asClass(Node10).singleton(),
    });
  }

  public async execute(): Promise<void> {
    this._container.resolve<Node1>('node1');
  }

  public override async tearDown(): Promise<void> {
    await this._container.dispose();
  }
}
