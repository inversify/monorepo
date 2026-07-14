import { inject, injectable } from '@inversifyjs/core';

import { InversifyCurrentBaseScenario } from './InversifyCurrentBaseScenario.js';

@injectable()
class FinalNode {
  public log() {
    return 'log!';
  }
}

@injectable()
class Node10 {
  @inject(FinalNode)
  private readonly node2!: FinalNode;

  private readonly node1: FinalNode;

  constructor(node1: FinalNode) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node9 {
  @inject(Node10)
  private readonly node2!: Node10;

  private readonly node1: Node10;

  constructor(node1: Node10) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node8 {
  @inject(Node9)
  private readonly node2!: Node9;

  private readonly node1: Node9;

  constructor(node1: Node9) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node7 {
  @inject(Node8)
  private readonly node2!: Node8;

  private readonly node1: Node8;

  constructor(node1: Node8) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node6 {
  @inject(Node7)
  private readonly node2!: Node7;

  private readonly node1: Node7;

  constructor(node1: Node7) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node5 {
  @inject(Node6)
  private readonly node2!: Node6;

  private readonly node1: Node6;

  constructor(node1: Node6) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node4 {
  @inject(Node5)
  private readonly node2!: Node5;

  private readonly node1: Node5;

  constructor(node1: Node5) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node3 {
  @inject(Node4)
  private readonly node2!: Node4;

  private readonly node1: Node4;

  constructor(node1: Node4) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node2 {
  @inject(Node3)
  private readonly node2!: Node3;

  private readonly node1: Node3;

  constructor(node1: Node3) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node1 {
  @inject(Node2)
  private readonly node2!: Node2;

  private readonly node1: Node2;

  constructor(node1: Node2) {
    this.node1 = node1;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

export class InversifyCurrentGetComplexServiceWithPropertiesInTransientScope extends InversifyCurrentBaseScenario {
  public override async setUp(): Promise<void> {
    this._container.bind(FinalNode).toSelf().inTransientScope();
    this._container.bind(Node1).toSelf().inTransientScope();
    this._container.bind(Node2).toSelf().inTransientScope();
    this._container.bind(Node3).toSelf().inTransientScope();
    this._container.bind(Node4).toSelf().inTransientScope();
    this._container.bind(Node5).toSelf().inTransientScope();
    this._container.bind(Node6).toSelf().inTransientScope();
    this._container.bind(Node7).toSelf().inTransientScope();
    this._container.bind(Node8).toSelf().inTransientScope();
    this._container.bind(Node9).toSelf().inTransientScope();
    this._container.bind(Node10).toSelf().inTransientScope();
  }

  public async execute(): Promise<void> {
    this._container.get(Node1);
  }

  public override async tearDown(): Promise<void> {
    await this._container.unbindAllAsync();
  }
}
