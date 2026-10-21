import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type Dispatch,
  type ReactElement,
  type SetStateAction,
  useState,
} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import { CallPage } from './call/CallPage.js';
import { CallsPage } from './calls/CallsPage.js';
import { routerBasename } from './routerBasename.js';
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
        <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
          <Routes>
            <Route element={<CallsPage />} path="/" />
            <Route element={<CallPage />} path="/calls/:callId" />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
