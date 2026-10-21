import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  type CallsPage,
  type CallsSearch,
  type CallSummary,
  fetchCallsPage,
  nextCallsPage,
} from './callsApi.js';

const CALLS_QUERY_KEY: string = 'calls';

export interface CallsState {
  readonly hasNextPage: boolean;
  readonly isInitialError: boolean;
  readonly isInitialLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly isNextPageError: boolean;
  readonly items: readonly CallSummary[];
  readonly loadMore: () => void;
  readonly retry: () => void;
  readonly total: number;
}

export function useCalls(search: CallsSearch): CallsState {
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
    InfiniteData<CallsPage, number>,
    Error
  > = useInfiniteQuery({
    getNextPageParam: nextCallsPage,
    initialPageParam: 1,
    queryFn: async ({
      pageParam,
      signal,
    }: {
      pageParam: number;
      signal: AbortSignal;
    }): Promise<CallsPage> =>
      fetchCallsPage(
        {
          page: pageParam,
          requestMethod: search.requestMethod,
          requestUrlLike: search.requestUrlLike,
          responseStatusCode: search.responseStatusCode,
        },
        signal,
      ),
    queryKey: [
      CALLS_QUERY_KEY,
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
    items: data?.pages.flatMap((page: CallsPage) => page.items) ?? [],
    loadMore,
    retry,
    total: data?.pages.at(0)?.total ?? 0,
  };
}
