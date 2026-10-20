import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type Dispatch,
  type ReactElement,
  type SetStateAction,
  useState,
} from 'react';

import { ExecutionsPage } from './executions/ExecutionsPage.js';
import { ThemeProvider } from './theme/ThemeProvider.js';

const QUERY_RETRY_COUNT: number = 1;

export function App(): ReactElement {
  const queryClientState: [QueryClient, Dispatch<SetStateAction<QueryClient>>] =
    useState(
      (): QueryClient =>
        new QueryClient({
          defaultOptions: {
            queries: {
              refetchOnWindowFocus: false,
              retry: QUERY_RETRY_COUNT,
            },
          },
        }),
    );
  const queryClient: QueryClient = queryClientState[0];

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ExecutionsPage />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
