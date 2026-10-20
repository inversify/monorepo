import { type ReactElement, useEffect, useRef } from 'react';

const SENTINEL_ROOT_MARGIN: string = '240px';

export interface InfiniteScrollSentinelProps {
  readonly disabled: boolean;
  readonly onVisible: () => void;
}

export function InfiniteScrollSentinel(
  props: InfiniteScrollSentinelProps,
): ReactElement {
  const ref: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node: HTMLDivElement | null = ref.current;

    if (node === null || props.disabled) {
      return undefined;
    }

    const observer: IntersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        if (
          entries.some(
            (entry: IntersectionObserverEntry): boolean => entry.isIntersecting,
          )
        ) {
          props.onVisible();
        }
      },
      {
        rootMargin: SENTINEL_ROOT_MARGIN,
      },
    );

    observer.observe(node);

    return (): void => {
      observer.disconnect();
    };
  }, [props.disabled, props.onVisible]);

  return <div className="sentinel" ref={ref} />;
}
