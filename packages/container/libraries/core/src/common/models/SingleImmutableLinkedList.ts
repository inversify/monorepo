export interface SingleImmutableLinkedListNode<T> {
  elem: T;
  previous: SingleImmutableLinkedListNode<T> | undefined;
}

export class SingleImmutableLinkedList<T> implements Iterable<T> {
  constructor(public readonly last: SingleImmutableLinkedListNode<T>) {}

  public concat(elem: T): SingleImmutableLinkedList<T> {
    return new SingleImmutableLinkedList({
      elem,
      previous: this.last,
    });
  }

  public [Symbol.iterator](): Iterator<T> {
    let node: SingleImmutableLinkedListNode<T> | undefined = this.last;

    return {
      next: (): IteratorResult<T> => {
        if (node === undefined) {
          return {
            done: true,
            value: undefined,
          };
        }

        const elem: T = node.elem;
        node = node.previous;

        return {
          done: false,
          value: elem,
        };
      },
    };
  }
}
