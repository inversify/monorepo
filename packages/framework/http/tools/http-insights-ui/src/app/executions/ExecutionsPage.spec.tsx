import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { type ReactElement } from 'react';

import { ThemeProvider } from '../theme/ThemeProvider.js';
import { ExecutionsPage } from './ExecutionsPage.js';

const PAGE_SIZE: number = 20;

class ImmediateIntersectionObserver {
  readonly #callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.#callback = callback;
  }

  public disconnect(): void {}

  public observe(target: Element): void {
    queueMicrotask(() => {
      this.#callback(
        [
          {
            isIntersecting: true,
            target,
          } as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver,
      );
    });
  }

  public takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  public unobserve(): void {}
}

describe(ExecutionsPage, () => {
  beforeEach(() => {
    document.documentElement.dataset['theme'] = 'dark';
    window.history.replaceState(null, '', '/');
    vitest.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vitest.unstubAllGlobals();
    vitest.restoreAllMocks();
  });

  describe('having two pages of executions', () => {
    describe('when rendered', () => {
      it('should load the next page when the sentinel is visible', async () => {
        const requestedPages: string[] = [];

        vitest
          .spyOn(globalThis, 'fetch')
          .mockImplementation(
            async (input: RequestInfo | URL): Promise<Response> => {
              const url: URL = new URL(
                readFetchInput(input),
                'http://insights.local',
              );
              const page: string = url.searchParams.get('page') ?? '';

              requestedPages.push(page);

              return Promise.resolve(
                new Response(JSON.stringify(executionPage(Number(page))), {
                  headers: {
                    'content-type': 'application/json',
                  },
                  status: 200,
                }),
              );
            },
          );

        renderPage();

        await waitFor(() => {
          expect(document.querySelectorAll('tbody tr')).toHaveLength(
            PAGE_SIZE + 1,
          );
        });

        expect(requestedPages).toStrictEqual(['1', '2']);
        expect(screen.getByText('21 executions')).toBeTruthy();
      });
    });
  });

  describe('having a failing executions request', () => {
    describe('when rendered', () => {
      it('should show an error', async () => {
        vitest.spyOn(globalThis, 'fetch').mockResolvedValue(
          new Response(null, {
            status: 500,
          }),
        );

        renderPage();

        expect(
          await screen.findByText("Couldn't load executions."),
        ).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
      });
    });
  });
});

function readFetchInput(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.href;
  }

  return input.url;
}

function renderPage(): void {
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const page: ReactElement = (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ExecutionsPage />
      </QueryClientProvider>
    </ThemeProvider>
  );

  render(page);
}

function executionPage(page: number): {
  items: readonly {
    id: string;
    request: {
      method: string;
      startedAt: string;
      url: string;
    };
    response: {
      sentAt: string;
    };
  }[];
  total: number;
} {
  const length: number = page === 1 ? PAGE_SIZE : 1;

  return {
    items: Array.from({ length }, (_unused: unknown, index: number) => ({
      id: `execution-${String(page)}-${String(index)}`,
      request: {
        method: 'GET',
        startedAt: '2026-10-19T20:00:00.000Z',
        url: `/users/${String(index)}`,
      },
      response: {
        sentAt: '2026-10-19T20:00:00.018Z',
      },
    })),
    total: PAGE_SIZE + 1,
  };
}
