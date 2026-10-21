import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { type ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';

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

  describe('having recorded executions', () => {
    describe('when a request method is selected and the dialog is closed', () => {
      it('should leave the executions unfiltered', async () => {
        const urls: string[] = mockExecutions();

        renderPage();
        await screen.findByText('1 execution');
        fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
        fireEvent.click(screen.getByRole('button', { name: 'POST' }));
        fireEvent.click(screen.getByRole('button', { name: 'Close filters' }));

        expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull();
        expect(screen.queryByText('method is POST')).toBeNull();
        expect(window.location.search.includes('requestMethod=')).toBe(false);
        expect(urls.some(includesRequestMethod)).toBe(false);
      });
    });

    describe('when a request method is applied', () => {
      it('should filter by that method and show a removable chip', async () => {
        const urls: string[] = mockExecutions();

        renderPage();
        await screen.findByText('1 execution');
        fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
        fireEvent.click(screen.getByRole('button', { name: 'POST' }));
        fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

        expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull();
        expect(screen.getByText('method is POST')).toBeTruthy();
        expect(window.location.search).toContain('requestMethod=POST');
        await waitFor(() => {
          expect(latestUrl(urls)).toContain('requestMethod=POST');
        });

        fireEvent.click(
          screen.getByRole('button', { name: 'Remove method filter' }),
        );

        expect(screen.queryByText('method is POST')).toBeNull();
        expect(window.location.search.includes('requestMethod=')).toBe(false);
        await waitFor(() => {
          expect(latestUrl(urls).includes('requestMethod=')).toBe(false);
        });
      });
    });

    describe('when a response status is applied by its reason', () => {
      it('should filter by that status and show a removable chip', async () => {
        const urls: string[] = mockExecutions();

        renderPage();
        await screen.findByText('1 execution');
        fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
        fireEvent.change(
          screen.getByRole('combobox', { name: 'Response status code' }),
          {
            target: {
              value: 'Bad',
            },
          },
        );

        expect(
          screen.getByRole('option', { name: '400 Bad Request' }),
        ).toBeTruthy();
        expect(
          screen.getByRole('option', { name: '502 Bad Gateway' }),
        ).toBeTruthy();
        expect(screen.queryByRole('option', { name: '200 OK' })).toBeNull();

        fireEvent.click(
          screen.getByRole('option', { name: '400 Bad Request' }),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

        expect(screen.getByText('status is 400')).toBeTruthy();
        expect(window.location.search).toContain('responseStatusCode=400');
        await waitFor(() => {
          expect(latestUrl(urls)).toContain('responseStatusCode=400');
        });

        fireEvent.click(
          screen.getByRole('button', { name: 'Remove status filter' }),
        );

        expect(screen.queryByText('status is 400')).toBeNull();
        expect(window.location.search.includes('responseStatusCode=')).toBe(
          false,
        );
        await waitFor(() => {
          expect(latestUrl(urls).includes('responseStatusCode=')).toBe(false);
        });
      });
    });

    describe('when filters are applied over a URL search', () => {
      it('should keep requestUrlLike in the page query', async () => {
        mockExecutions();
        renderPage();
        await screen.findByText('1 execution');
        fireEvent.change(
          screen.getByRole('searchbox', { name: 'Search by URL' }),
          {
            target: {
              value: '/users',
            },
          },
        );
        fireEvent.click(screen.getByRole('button', { name: 'Search' }));
        fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
        fireEvent.click(screen.getByRole('button', { name: 'DELETE' }));
        fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

        const params: URLSearchParams = new URLSearchParams(
          window.location.search,
        );

        expect(params.get('requestUrlLike')).toBe('/users');
        expect(params.get('requestMethod')).toBe('DELETE');
      });
    });
  });

  describe('having filter query parameters', () => {
    describe('when rendered', () => {
      it('should apply those filters', async () => {
        window.history.replaceState(
          null,
          '',
          '/?requestMethod=DELETE&responseStatusCode=404',
        );
        const urls: string[] = mockExecutions();

        renderPage();

        expect(await screen.findByText('method is DELETE')).toBeTruthy();
        expect(screen.getByText('status is 404')).toBeTruthy();
        await waitFor(() => {
          const url: URL = new URL(latestUrl(urls), 'http://insights.local');

          expect(url.searchParams.get('requestMethod')).toBe('DELETE');
          expect(url.searchParams.get('responseStatusCode')).toBe('404');
        });
      });
    });
  });

  describe('having a recorded execution', () => {
    describe('when its row is activated', () => {
      it('should open the execution page', async () => {
        mockExecutions();
        renderNavigablePage();

        fireEvent.click(await screen.findByRole('link', { name: '/users' }));

        expect(await screen.findByText('Opened execution')).toBeTruthy();
      });
    });
  });
});

function latestUrl(urls: readonly string[]): string {
  return urls.at(-1) ?? '';
}

function includesRequestMethod(url: string): boolean {
  return new URL(url, 'http://insights.local').searchParams.has(
    'requestMethod',
  );
}

function mockExecutions(): string[] {
  const urls: string[] = [];

  vitest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input: RequestInfo | URL): Promise<Response> => {
      urls.push(readFetchInput(input));

      return Promise.resolve(
        new Response(JSON.stringify(singleExecutionPage()), {
          headers: {
            'content-type': 'application/json',
          },
          status: 200,
        }),
      );
    });

  return urls;
}

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
        <MemoryRouter>
          <ExecutionsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );

  render(page);
}

function renderNavigablePage(): void {
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<ExecutionsPage />} path="/" />
            <Route
              element={<p>Opened execution</p>}
              path="/executions/:executionId"
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

function singleExecutionPage(): {
  items: readonly {
    id: string;
    request: {
      method: string;
      startedAt: string;
      url: string;
    };
    response: {
      sentAt: string;
      statusCode: number;
    };
  }[];
  total: number;
} {
  return {
    items: [
      {
        id: 'execution-1',
        request: {
          method: 'GET',
          startedAt: '2026-10-19T20:00:00.000Z',
          url: '/users',
        },
        response: {
          sentAt: '2026-10-19T20:00:00.018Z',
          statusCode: 200,
        },
      },
    ],
    total: 1,
  };
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
      statusCode: number;
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
        statusCode: 201,
      },
    })),
    total: PAGE_SIZE + 1,
  };
}
