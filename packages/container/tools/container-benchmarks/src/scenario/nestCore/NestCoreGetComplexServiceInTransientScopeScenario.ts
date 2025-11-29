import { Scenario } from '@inversifyjs/benchmark-utils';
import {
  INestApplicationContext,
  Injectable,
  Module,
  Scope,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { Platform } from '../models/Platform';

@Injectable({ scope: Scope.TRANSIENT })
class FinalNode {
  public log() {
    return 'log!';
  }
}

@Injectable({ scope: Scope.TRANSIENT })
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

@Injectable({ scope: Scope.TRANSIENT })
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

@Injectable({ scope: Scope.TRANSIENT })
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

@Injectable({ scope: Scope.TRANSIENT })
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

@Injectable({ scope: Scope.TRANSIENT })
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

@Injectable({ scope: Scope.TRANSIENT })
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

@Injectable({ scope: Scope.TRANSIENT })
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

@Injectable({ scope: Scope.TRANSIENT })
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

@Injectable({ scope: Scope.TRANSIENT })
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

@Injectable({ scope: Scope.TRANSIENT })
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

@Module({
  exports: [Node1],
  providers: [
    Node1,
    Node2,
    Node3,
    Node4,
    Node5,
    Node6,
    Node7,
    Node8,
    Node9,
    Node10,
    FinalNode,
  ],
})
class ContainerModule {}

export class NestCoreGetComplexServiceInTransientScopeScenario implements Scenario<Platform> {
  public readonly platform: Platform;

  #context!: INestApplicationContext;

  constructor() {
    this.platform = Platform.nestJs;
  }

  public async setUp(): Promise<void> {
    this.#context = await NestFactory.createApplicationContext(
      ContainerModule,
      { logger: false },
    );
  }

  public async tearDown(): Promise<void> {
    await this.#context.close();
  }

  public async execute(): Promise<void> {
    await this.#context.resolve(Node1);
  }
}
