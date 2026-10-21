import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';

import { type CallDetail, CallNotFoundError, fetchCall } from './callApi.js';

const CALL_QUERY_KEY: string = 'call';

export interface CallState {
  readonly call: CallDetail | undefined;
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly isNotFound: boolean;
  readonly retry: () => void;
}

export function useCall(callId: string | undefined): CallState {
  const enabled: boolean = callId !== undefined && callId.length > 0;
  const {
    data,
    error,
    isError,
    isPending,
    refetch,
  }: UseQueryResult<CallDetail, Error> = useQuery({
    enabled,
    queryFn: async ({ signal }: { signal: AbortSignal }): Promise<CallDetail> =>
      fetchCall(callId ?? '', signal),
    queryKey: [CALL_QUERY_KEY, callId ?? ''],
  });
  const retry: () => void = useCallback((): void => {
    void refetch();
  }, [refetch]);

  return {
    call: data,
    isError: isError && !(error instanceof CallNotFoundError),
    isLoading: enabled && isPending,
    isNotFound: error instanceof CallNotFoundError,
    retry,
  };
}
