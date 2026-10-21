import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  buildSearchWithExecutionFilters,
  readExecutionFilters,
} from './executionFiltersSearch.js';
import { type ExecutionFilters } from './executionsApi.js';

export interface ExecutionFiltersQuery {
  readonly filters: ExecutionFilters;
  readonly setFilters: (filters: ExecutionFilters) => void;
}

export function useExecutionFilters(): ExecutionFiltersQuery {
  const filtersState: [
    ExecutionFilters,
    Dispatch<SetStateAction<ExecutionFilters>>,
  ] = useState((): ExecutionFilters =>
    readExecutionFilters(window.location.search),
  );
  const filters: ExecutionFilters = filtersState[0];
  const setFiltersState: Dispatch<SetStateAction<ExecutionFilters>> =
    filtersState[1];

  useEffect(() => {
    const onPopState: () => void = (): void => {
      setFiltersState(readExecutionFilters(window.location.search));
    };

    window.addEventListener('popstate', onPopState);

    return (): void => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const setFilters: (value: ExecutionFilters) => void = useCallback(
    (value: ExecutionFilters): void => {
      const nextSearch: string = buildSearchWithExecutionFilters(
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
