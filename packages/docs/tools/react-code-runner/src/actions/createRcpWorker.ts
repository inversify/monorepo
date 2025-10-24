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
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error });
  }
});
`;

interface RpcWorkerMessage {
  args: unknown[];
  id: number;
  code: string;
}

type RpcWorkerResultMessage =
  | RpcWorkerResultErrorMessage
  | RpcWorkerResultSuccessMessage;

interface RpcWorkerResultErrorMessage {
  id: number;
  error: unknown;
}

interface RpcWorkerResultSuccessMessage {
  id: number;
  result: unknown;
}

interface RpcCallbacks {
  resolve: (result: unknown) => void;
  reject: (reason: unknown) => void;
}

export interface CreateRpcWorkerResult {
  rpc: (args: unknown[], code: string) => Promise<unknown>;
  terminate: () => void;
}

export default function createRpcWorker(): CreateRpcWorkerResult {
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

  worker.addEventListener(
    'message',
    (ev: MessageEvent<RpcWorkerResultMessage>) => {
      const data: RpcWorkerResultMessage = ev.data;

      const rpcCallback: RpcCallbacks | undefined = callbacksMap.get(data.id);

      if (rpcCallback === undefined) return;

      callbacksMap.delete(data.id);

      if ((data as Partial<RpcWorkerResultErrorMessage>).error === undefined) {
        const { result }: RpcWorkerResultSuccessMessage =
          data as RpcWorkerResultSuccessMessage;

        rpcCallback.resolve(result);
      } else {
        const { error }: RpcWorkerResultErrorMessage =
          data as RpcWorkerResultErrorMessage;

        rpcCallback.reject(error);
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
