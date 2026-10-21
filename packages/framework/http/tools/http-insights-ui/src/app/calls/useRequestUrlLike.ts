import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  buildSearchWithRequestUrlLike,
  readRequestUrlLike,
} from './requestUrlLike.js';

export interface RequestUrlLikeQuery {
  readonly requestUrlLike: string;
  readonly setRequestUrlLike: (requestUrlLike: string) => void;
}

export function useRequestUrlLike(): RequestUrlLikeQuery {
  const requestUrlLikeState: [string, Dispatch<SetStateAction<string>>] =
    useState((): string => readRequestUrlLike(window.location.search));
  const requestUrlLike: string = requestUrlLikeState[0];
  const setRequestUrlLikeState: Dispatch<SetStateAction<string>> =
    requestUrlLikeState[1];

  useEffect(() => {
    const onPopState: () => void = (): void => {
      setRequestUrlLikeState(readRequestUrlLike(window.location.search));
    };

    window.addEventListener('popstate', onPopState);

    return (): void => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const setRequestUrlLike: (value: string) => void = useCallback(
    (value: string): void => {
      const nextSearch: string = buildSearchWithRequestUrlLike(
        window.location.search,
        value,
      );
      const nextUrl: string = `${window.location.pathname}${nextSearch}`;
      const currentUrl: string = `${window.location.pathname}${window.location.search}`;

      if (nextUrl !== currentUrl) {
        window.history.pushState(null, '', nextUrl);
      }

      setRequestUrlLikeState(value);
    },
    [],
  );

  return {
    requestUrlLike,
    setRequestUrlLike,
  };
}
