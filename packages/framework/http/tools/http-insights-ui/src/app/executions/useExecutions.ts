import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  type ExecutionsPage,
  type ExecutionsSearch,
  type ExecutionSummary,
  fetchExecutionsPage,
  nextExecutionsPage,
} from './executionsApi.js';

const EXECUTIONS_QUERY_KEY: string = 'executions';

export interface ExecutionsState {
  readonly hasNextPage: boolean;
  readonly isInitialError: boolean;
  readonly isInitialLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly isNextPageError: boolean;
  readonly items: readonly ExecutionSummary[];
  readonly loadMore: () => void;
  readonly retry: () => void;
  readonly total: number;
}

export function useExecutions(search: ExecutionsSearch): ExecutionsState {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isPending,
    refetch,
  }: UseInfiniteQueryResult<
    InfiniteData<ExecutionsPage, number>,
    Error
  > = useInfiniteQuery({
    getNextPageParam: nextExecutionsPage,
    initialPageParam: 1,
    queryFn: async ({
      pageParam,
      signal,
    }: {
      pageParam: number;
      signal: AbortSignal;
    }): Promise<ExecutionsPage> =>
      fetchExecutionsPage(
        {
          page: pageParam,
          requestMethod: search.requestMethod,
          requestUrlLike: search.requestUrlLike,
          responseStatusCode: search.responseStatusCode,
        },
        signal,
      ),
    queryKey: [
      EXECUTIONS_QUERY_KEY,
      search.requestMethod ?? '',
      search.requestUrlLike,
      search.responseStatusCode ?? '',
    ],
  });

  const loadMore: () => void = useCallback((): void => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const retry: () => void = useCallback((): void => {
    if (isFetchNextPageError) {
      void fetchNextPage();
      return;
    }

    void refetch();
  }, [fetchNextPage, isFetchNextPageError, refetch]);

  return {
    hasNextPage,
    isInitialError: isError && data === undefined,
    isInitialLoading: isPending,
    isLoadingMore: isFetchingNextPage,
    isNextPageError: isFetchNextPageError,
    items: data?.pages.flatMap((page: ExecutionsPage) => page.items) ?? [],
    loadMore,
    retry,
    total: data?.pages.at(0)?.total ?? 0,
  };
}
