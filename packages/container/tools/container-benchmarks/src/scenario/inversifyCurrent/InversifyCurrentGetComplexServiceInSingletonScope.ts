import { injectable } from '@inversifyjs/core';

import { InversifyCurrentBaseScenario } from './InversifyCurrentBaseScenario';

@injectable()
class FinalNode {
  public log() {
    return 'log!';
  }
}

@injectable()
class Node10 {
  private readonly node1: FinalNode;
  private readonly node2: FinalNode;

  constructor(node1: FinalNode, node2: FinalNode) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node9 {
  private readonly node1: Node10;
  private readonly node2: Node10;

  constructor(node1: Node10, node2: Node10) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node8 {
  private readonly node1: Node9;
  private readonly node2: Node9;

  constructor(node1: Node9, node2: Node9) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node7 {
  private readonly node1: Node8;
  private readonly node2: Node8;

  constructor(node1: Node8, node2: Node8) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node6 {
  private readonly node1: Node7;
  private readonly node2: Node7;

  constructor(node1: Node7, node2: Node7) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node5 {
  private readonly node1: Node6;
  private readonly node2: Node6;

  constructor(node1: Node6, node2: Node6) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node4 {
  private readonly node1: Node5;
  private readonly node2: Node5;

  constructor(node1: Node5, node2: Node5) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node3 {
  private readonly node1: Node4;
  private readonly node2: Node4;

  constructor(node1: Node4, node2: Node4) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node2 {
  private readonly node1: Node3;
  private readonly node2: Node3;

  constructor(node1: Node3, node2: Node3) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

@injectable()
class Node1 {
  private readonly node1: Node2;
  private readonly node2: Node2;

  constructor(node1: Node2, node2: Node2) {
    this.node1 = node1;
    this.node2 = node2;
  }

  public log() {
    return `${this.node1.log()} ${this.node2.log()}`;
  }
}

export class InversifyCurrentGetComplexServiceInSingletonScope extends InversifyCurrentBaseScenario {
  public override async setUp(): Promise<void> {
    this._container.bind(FinalNode).toSelf().inSingletonScope();
    this._container.bind(Node1).toSelf().inSingletonScope();
    this._container.bind(Node2).toSelf().inSingletonScope();
    this._container.bind(Node3).toSelf().inSingletonScope();
    this._container.bind(Node4).toSelf().inSingletonScope();
    this._container.bind(Node5).toSelf().inSingletonScope();
    this._container.bind(Node6).toSelf().inSingletonScope();
    this._container.bind(Node7).toSelf().inSingletonScope();
    this._container.bind(Node8).toSelf().inSingletonScope();
    this._container.bind(Node9).toSelf().inSingletonScope();
    this._container.bind(Node10).toSelf().inSingletonScope();
  }

  public async execute(): Promise<void> {
    this._container.get(Node1);
  }

  public override async tearDown(): Promise<void> {
    await this._container.unbindAllAsync();
  }
}
