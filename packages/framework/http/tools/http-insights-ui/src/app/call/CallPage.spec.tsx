import { afterEach, describe, expect, it, vitest } from 'vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

import { ThemeProvider } from '../theme/ThemeProvider.js';
import { CallPage } from './CallPage.js';

describe(CallPage, () => {
  afterEach(() => {
    cleanup();
    vitest.restoreAllMocks();
  });

  describe('having a call without controller, middlewares, or interceptors', () => {
    describe('when rendered', () => {
      it('should show the request and disable empty sections', async () => {
        mockCall(callPayload());
        renderPage();

        expect(
          await screen.findByRole('heading', { name: '/users' }),
        ).toBeTruthy();
        expect(screen.getByTitle('201 Created').textContent).toBe(
          '201 Created',
        );
        expect(
          screen.getByRole('tab', { name: 'Timeline', selected: true }),
        ).toBeTruthy();
        expect(
          screen.getByRole('img', { name: 'Timing waterfall' }),
        ).toBeTruthy();
        expect(screen.getByText('AuthGuard')).toBeTruthy();

        fireEvent.click(screen.getByRole('tab', { name: 'Request' }));

        expect(screen.getByRole('rowheader', { name: 'accept' })).toBeTruthy();
        expect(
          screen
            .getByRole('tab', { name: 'Middlewares' })
            .hasAttribute('disabled'),
        ).toBe(true);
        expect(
          screen
            .getByRole('tab', { name: 'Controller' })
            .hasAttribute('disabled'),
        ).toBe(true);
        expect(
          screen
            .getByRole('tab', { name: 'Interceptors' })
            .hasAttribute('disabled'),
        ).toBe(true);
        expect(
          screen.getByRole('tab', { name: 'Guards' }).hasAttribute('disabled'),
        ).toBe(false);

        fireEvent.click(screen.getByRole('tab', { name: 'Guards' }));

        expect(screen.getByText('AuthGuard')).toBeTruthy();
        expect(screen.getByText('Allowed')).toBeTruthy();

        fireEvent.click(screen.getByRole('tab', { name: 'Response' }));

        expect(
          screen.getByRole('rowheader', { name: 'content-type' }),
        ).toBeTruthy();
      });
    });
  });

  describe('having a guard error with traces', () => {
    describe('when rendered', () => {
      it('should show the traces instead of the error json', async () => {
        renderGuardError();

        fireEvent.click(await screen.findByRole('tab', { name: 'Guards' }));

        expect(screen.getByText('TypeError: boom')).toBeTruthy();
        expect(screen.getByText('handle')).toBeTruthy();
        expect(screen.getByText('handler.ts:12:5')).toBeTruthy();
        expect(screen.getByText('const value = read();')).toBeTruthy();
        expect(
          screen
            .getByText('throw new Error(value);')
            .getAttribute('aria-current'),
        ).toBe('true');
        expect(screen.getByText('return value;')).toBeTruthy();
        expect(screen.queryByText(/"message"/)).toBeNull();
      });

      it('should copy the full path with line and column', async () => {
        const writeText: ReturnType<typeof vitest.fn> = vitest.fn(
          async (): Promise<void> => undefined,
        );

        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText,
          },
        });
        renderGuardError();

        fireEvent.click(await screen.findByRole('tab', { name: 'Guards' }));

        const place: HTMLElement = screen.getByText('handler.ts:12:5');
        const button: HTMLElement = screen.getByRole('button', {
          name: 'Copy /app/src/handler.ts:12:5',
        });

        expect(place.nextElementSibling).toBe(button);

        fireEvent.click(button);

        expect(writeText).toHaveBeenCalledWith('/app/src/handler.ts:12:5');
        expect(
          await screen.findByRole('button', {
            name: 'Copied /app/src/handler.ts:12:5',
          }),
        ).toBeTruthy();
      });
    });
  });

  describe('having a guard on the timeline', () => {
    describe('when the guard bar is pressed', () => {
      it('should open that guard and keep the choice in the url', async () => {
        mockCall(callPayload());
        renderPage();

        fireEvent.click(
          await screen.findByRole('button', { name: 'AuthGuard' }),
        );

        expect(
          screen.getByRole('tab', { name: 'Guards', selected: true }),
        ).toBeTruthy();
        expect(
          screen.getByRole('article', { current: true }).textContent,
        ).toContain('AuthGuard');
        expect(screen.getByText('Allowed')).toBeTruthy();
        expect(
          screen.getByText('Search ?section=guards&stage=guard-guard-1'),
        ).toBeTruthy();
      });
    });
  });

  describe('having a selected guard', () => {
    describe('when Request is pressed', () => {
      it('should open the request and clear the stage', async () => {
        mockCall(callPayload());
        renderPage('/calls/call-1?section=guards&stage=guard-guard-1');

        fireEvent.click(await screen.findByRole('tab', { name: 'Request' }));

        expect(
          screen.getByRole('tab', { name: 'Request', selected: true }),
        ).toBeTruthy();
        expect(screen.getByRole('rowheader', { name: 'accept' })).toBeTruthy();
        expect(screen.getByText('Search ?section=request')).toBeTruthy();
      });
    });
  });

  describe('having a url for a selected guard', () => {
    describe('when rendered', () => {
      it('should open that guard', async () => {
        mockCall(callPayload());
        renderPage('/calls/call-1?section=guards&stage=guard-guard-1');

        expect(
          await screen.findByRole('tab', { name: 'Guards', selected: true }),
        ).toBeTruthy();
        expect(
          screen.getByRole('article', { current: true }).textContent,
        ).toContain('AuthGuard');
      });
    });
  });

  describe('having a missing call', () => {
    describe('when rendered', () => {
      it('should show a not found message', async () => {
        vitest.spyOn(globalThis, 'fetch').mockResolvedValue(
          new Response(null, {
            status: 404,
          }),
        );
        renderPage();

        expect(
          await screen.findByText('This call was not found.'),
        ).toBeTruthy();
      });
    });
  });
});

function renderGuardError(): void {
  const payload: {
    guards: Array<Record<string, unknown>>;
  } = callPayload() as {
    guards: Array<Record<string, unknown>>;
  };
  const guards: Array<Record<string, unknown>> = payload.guards;
  const guard: Record<string, unknown> | undefined = guards[0];

  if (guard === undefined) {
    throw new Error('Expected a guard.');
  }

  guard['allowed'] = false;
  guard['error'] = {
    message: 'boom',
    name: 'TypeError',
  };
  guard['errorTraces'] = [
    {
      location: {
        column: 5,
        file: '/app/src/handler.ts',
        filename: 'handler.ts',
        functionName: 'handle',
        line: 12,
      },
      nextStatements: ['return value;'],
      previousStatements: ['const value = read();'],
      traceStatement: 'throw new Error(value);',
    },
  ];
  mockCall(payload);
  renderPage();
}

function mockCall(payload: unknown): void {
  vitest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(payload), {
      headers: {
        'content-type': 'application/json',
      },
      status: 200,
    }),
  );
}

function renderPage(entry: string = '/calls/call-1'): void {
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
        <MemoryRouter initialEntries={[entry]}>
          <SearchText />
          <Routes>
            <Route element={<CallPage />} path="/calls/:callId" />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );

  render(page);
}

function SearchText(): ReactElement {
  const location: ReturnType<typeof useLocation> = useLocation();

  return <p>{`Search ${location.search}`}</p>;
}

function callPayload(): unknown {
  return {
    controller: null,
    guards: [
      {
        allowed: true,
        endedAt: '2026-10-19T20:00:00.006Z',
        error: null,
        guard: 'AuthGuard',
        id: 'guard-1',
        startedAt: '2026-10-19T20:00:00.002Z',
      },
    ],
    httpErrors: [],
    id: 'call-1',
    interceptors: [],
    middlewares: [],
    nativeMiddlewares: [],
    pipes: [],
    request: {
      headers: {
        accept: 'application/json',
      },
      id: 'request-1',
      method: 'POST',
      startedAt: '2026-10-19T20:00:00.000Z',
      url: '/users',
    },
    response: {
      aborted: false,
      headers: {
        'content-type': 'application/json',
      },
      id: 'response-1',
      sentAt: '2026-10-19T20:00:00.018Z',
      statusCode: 201,
    },
  };
}
