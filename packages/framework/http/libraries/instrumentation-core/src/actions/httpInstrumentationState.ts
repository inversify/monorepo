import { randomUUID } from 'node:crypto';

import { type HttpInstrumentationScope } from '../models/HttpInstrumentationScope.js';
import {
  type HttpInstrumentationState,
  httpInstrumentationStateSymbol,
} from '../models/httpInstrumentationStateSymbol.js';

interface HttpInstrumentationStateCarrier {
  [httpInstrumentationStateSymbol]?: HttpInstrumentationState | undefined;
}

export function initializeHttpInstrumentationRequest(
  request: object,
  requestId: string,
): void {
  const carrier: HttpInstrumentationStateCarrier = request;

  if (carrier[httpInstrumentationStateSymbol] !== undefined) {
    return;
  }

  carrier[httpInstrumentationStateSymbol] = {
    executionStack: [],
    requestId,
  };
}

export function openHttpInstrumentationScope(
  request: object,
  executionId: string,
): HttpInstrumentationScope {
  const state: HttpInstrumentationState =
    getOrCreateHttpInstrumentationState(request);
  const parentExecutionId: string | undefined = state.executionStack.at(-1);

  state.executionStack.push(executionId);

  return {
    executionId,
    parentExecutionId,
    requestId: state.requestId,
  };
}

export function closeHttpInstrumentationScope(
  request: object,
  executionId: string,
): void {
  const state: HttpInstrumentationState | undefined =
    readHttpInstrumentationState(request);

  if (state === undefined) {
    return;
  }

  const executionIndex: number = state.executionStack.lastIndexOf(executionId);

  if (executionIndex === -1) {
    return;
  }

  state.executionStack.splice(executionIndex, 1);
}

function getOrCreateHttpInstrumentationState(
  request: object,
): HttpInstrumentationState {
  const carrier: HttpInstrumentationStateCarrier = request;
  const state: HttpInstrumentationState | undefined =
    carrier[httpInstrumentationStateSymbol];

  if (state !== undefined) {
    return state;
  }

  const createdState: HttpInstrumentationState = {
    executionStack: [],
    requestId: randomUUID(),
  };

  carrier[httpInstrumentationStateSymbol] = createdState;

  return createdState;
}

function readHttpInstrumentationState(
  request: object,
): HttpInstrumentationState | undefined {
  return (request as HttpInstrumentationStateCarrier)[
    httpInstrumentationStateSymbol
  ];
}
