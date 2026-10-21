import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  type ExecutionDetail,
  ExecutionNotFoundError,
  fetchExecution,
} from './executionApi.js';

const EXECUTION_QUERY_KEY: string = 'execution';

export interface ExecutionState {
  readonly execution: ExecutionDetail | undefined;
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly isNotFound: boolean;
  readonly retry: () => void;
}

export function useExecution(executionId: string | undefined): ExecutionState {
  const enabled: boolean = executionId !== undefined && executionId.length > 0;
  const {
    data,
    error,
    isError,
    isPending,
    refetch,
  }: UseQueryResult<ExecutionDetail, Error> = useQuery({
    enabled,
    queryFn: async ({
      signal,
    }: {
      signal: AbortSignal;
    }): Promise<ExecutionDetail> => fetchExecution(executionId ?? '', signal),
    queryKey: [EXECUTION_QUERY_KEY, executionId ?? ''],
  });
  const retry: () => void = useCallback((): void => {
    void refetch();
  }, [refetch]);

  return {
    execution: data,
    isError: isError && !(error instanceof ExecutionNotFoundError),
    isLoading: enabled && isPending,
    isNotFound: error instanceof ExecutionNotFoundError,
    retry,
  };
}
