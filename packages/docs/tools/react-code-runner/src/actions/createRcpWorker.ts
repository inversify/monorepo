import { GetPlanOptions, PlanResult } from '@inversifyjs/core';

import { Cloneable } from '../clone/models/Cloneable';

const WORKER_SCRIPT: string = `
self.addEventListener('message', async (ev) => {
  const { id, code, args } = ev.data || {};
  try {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);

    const mod = await import(url);
    URL.revokeObjectURL(url);

    const fn = mod.default;
    if (typeof fn !== 'function')
      throw new Error('Default export must be a function');

    const result = await fn(...args);
    self.postMessage({ id, kind: 'success', result });
  } catch (error) {
    self.postMessage({ id, kind: 'error', error });
  }
});
`;

interface RpcWorkerMessage {
  args: unknown[];
  id: number;
  code: string;
}

interface BaseRpcWorkerResultMessage<TKind extends RpcWorkerResultMessageKind> {
  kind: TKind;
}

enum RpcWorkerResultMessageKind {
  error = 'error',
  plan = 'plan',
  success = 'success',
}

type RpcWorkerResultMessage =
  | RpcWorkerResultErrorMessage
  | RpcWorkerResultPlanMessage
  | RpcWorkerResultSuccessMessage;

interface RpcWorkerResultErrorMessage extends BaseRpcWorkerResultMessage<RpcWorkerResultMessageKind.error> {
  id: number;
  error: unknown;
}

interface RpcWorkerResultPlanMessage extends BaseRpcWorkerResultMessage<RpcWorkerResultMessageKind.plan> {
  options: Cloneable<GetPlanOptions>;
  result: Cloneable<PlanResult>;
}

interface RpcWorkerResultSuccessMessage extends BaseRpcWorkerResultMessage<RpcWorkerResultMessageKind.success> {
  id: number;
  result: unknown;
}

interface RpcCallbacks {
  resolve: (result: unknown) => void;
  reject: (reason: unknown) => void;
}

interface CreateRpcWorkerOptions {
  onPlan?:
    | ((
        options: Cloneable<GetPlanOptions>,
        result: Cloneable<PlanResult>,
      ) => void | Promise<void>)
    | undefined;
}

export interface CreateRpcWorkerResult {
  rpc: (args: unknown[], code: string) => Promise<unknown>;
  terminate: () => void;
}

export default function createRpcWorker(
  options?: CreateRpcWorkerOptions,
): CreateRpcWorkerResult {
  const blob: Blob = new Blob([WORKER_SCRIPT], { type: 'text/javascript' });
  const workerUrl: string = URL.createObjectURL(blob);

  const worker: Worker = new Worker(workerUrl, { type: 'module' });
  URL.revokeObjectURL(workerUrl);

  let nextId: number = 1;

  const callbacksMap: Map<
    number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { resolve: (...args: any[]) => unknown; reject: (reason: unknown) => void }
  > = new Map();

  worker.addEventListener('error', (errorEvent: ErrorEvent) => {
    const error: Error = new Error(`Worker error: ${errorEvent.message}`, {
      cause: errorEvent.error,
    });

    for (const callbacks of callbacksMap.values()) {
      callbacks.reject(error);
    }

    callbacksMap.clear();
  });

  function handleCallbackMapOnMessageId(id: number): RpcCallbacks | undefined {
    const rpcCallback: RpcCallbacks | undefined = callbacksMap.get(id);

    if (rpcCallback === undefined) return;

    callbacksMap.delete(id);

    return rpcCallback;
  }

  worker.addEventListener(
    'message',
    (ev: MessageEvent<RpcWorkerResultMessage>) => {
      switch (ev.data.kind) {
        case RpcWorkerResultMessageKind.error:
          {
            const rpcCallback: RpcCallbacks | undefined =
              handleCallbackMapOnMessageId(ev.data.id);

            if (rpcCallback === undefined) {
              return;
            }

            rpcCallback.reject(ev.data.error);
          }
          break;
        case RpcWorkerResultMessageKind.plan:
          {
            void options?.onPlan?.(ev.data.options, ev.data.result);
          }
          break;
        case RpcWorkerResultMessageKind.success:
          {
            const rpcCallback: RpcCallbacks | undefined =
              handleCallbackMapOnMessageId(ev.data.id);

            if (rpcCallback === undefined) {
              return;
            }

            rpcCallback.resolve(ev.data.result);
          }
          break;
      }
    },
  );

  worker.addEventListener('messageerror', () => {
    const error: Error = new Error('Worker message serialization error');

    for (const callbacks of callbacksMap.values()) {
      callbacks.reject(error);
    }

    callbacksMap.clear();
  });

  async function rpc(args: unknown[], code: string): Promise<unknown> {
    const id: number = nextId++;
    return new Promise<unknown>(
      (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolve: (...args: any[]) => unknown,
        reject: (reason: unknown) => void,
      ) => {
        callbacksMap.set(id, { reject, resolve });

        const message: RpcWorkerMessage = { args, code, id };

        worker.postMessage(message);
      },
    );
  }

  return {
    rpc,
    terminate: () => {
      worker.terminate();
    },
  };
}
