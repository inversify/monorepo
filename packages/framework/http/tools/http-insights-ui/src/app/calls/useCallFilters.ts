import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  buildSearchWithCallFilters,
  readCallFilters,
} from './callFiltersSearch.js';
import { type CallFilters } from './callsApi.js';

export interface CallFiltersQuery {
  readonly filters: CallFilters;
  readonly setFilters: (filters: CallFilters) => void;
}

export function useCallFilters(): CallFiltersQuery {
  const filtersState: [CallFilters, Dispatch<SetStateAction<CallFilters>>] =
    useState((): CallFilters => readCallFilters(window.location.search));
  const filters: CallFilters = filtersState[0];
  const setFiltersState: Dispatch<SetStateAction<CallFilters>> =
    filtersState[1];

  useEffect(() => {
    const onPopState: () => void = (): void => {
      setFiltersState(readCallFilters(window.location.search));
    };

    window.addEventListener('popstate', onPopState);

    return (): void => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const setFilters: (value: CallFilters) => void = useCallback(
    (value: CallFilters): void => {
      const nextSearch: string = buildSearchWithCallFilters(
        window.location.search,
        value,
      );
      const nextUrl: string = `${window.location.pathname}${nextSearch}`;
      const currentUrl: string = `${window.location.pathname}${window.location.search}`;

      if (nextUrl !== currentUrl) {
        window.history.pushState(null, '', nextUrl);
      }

      setFiltersState(value);
    },
    [],
  );

  return {
    filters,
    setFilters,
  };
}
