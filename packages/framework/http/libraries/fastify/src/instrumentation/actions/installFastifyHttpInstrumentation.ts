import { randomUUID } from 'node:crypto';

import {
  closeHttpInstrumentationScope,
  emitHttpInstrumentationEvent,
  type HttpInstrumentationContext,
  type HttpInstrumentationScope,
  type HttpStageClock,
  initializeHttpInstrumentationRequest,
  openHttpInstrumentationScope,
  readHttpStageDuration,
  redactHttpHeaders,
  startHttpStage,
} from '@inversifyjs/http-instrumentation-core';
import {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
  type HookHandlerDoneFunction,
} from 'fastify';

const fastifyRequestObservationSymbol: unique symbol = Symbol(
  '@inversifyjs/http-fastify/requestObservation',
);

interface FastifyRequestObservation {
  readonly executionId: string;
  readonly reply: FastifyReply;
  readonly requestId: string;
  readonly stage: HttpStageClock;
}

interface FastifyRequestObservationCarrier {
  [fastifyRequestObservationSymbol]?: FastifyRequestObservation | undefined;
}

export function installFastifyHttpInstrumentation(
  app: FastifyInstance,
  instrumentation: HttpInstrumentationContext,
): void {
  app.addHook(
    'onRequest',
    (
      request: FastifyRequest,
      reply: FastifyReply,
      done: HookHandlerDoneFunction,
    ): void => {
      startFastifyRequestObservation(request, reply, instrumentation);
      done();
    },
  );
  app.addHook(
    'onResponse',
    (
      request: FastifyRequest,
      reply: FastifyReply,
      done: HookHandlerDoneFunction,
    ): void => {
      finishFastifyRequestObservation(request, reply, instrumentation, false);
      done();
    },
  );
  app.addHook(
    'onRequestAbort',
    (request: FastifyRequest, done: HookHandlerDoneFunction): void => {
      const observation: FastifyRequestObservation | undefined =
        readFastifyRequestObservation(request);

      if (observation !== undefined) {
        finishFastifyRequestObservation(
          request,
          observation.reply,
          instrumentation,
          true,
        );
      }

      done();
    },
  );
}

function startFastifyRequestObservation(
  request: FastifyRequest,
  reply: FastifyReply,
  instrumentation: HttpInstrumentationContext,
): void {
  if (readFastifyRequestObservation(request) !== undefined) {
    return;
  }

  const requestId: string = randomUUID();
  const stage: HttpStageClock = startHttpStage();

  initializeHttpInstrumentationRequest(request, requestId);

  const scope: HttpInstrumentationScope = openHttpInstrumentationScope(
    request,
    randomUUID(),
  );
  const observation: FastifyRequestObservation = {
    executionId: scope.executionId,
    reply,
    requestId: scope.requestId,
    stage,
  };

  writeFastifyRequestObservation(request, observation);

  emitHttpInstrumentationEvent(
    instrumentation.sinks,
    {
      executionId: scope.executionId,
      headers: redactHttpHeaders(request.headers),
      method: request.method,
      requestId: scope.requestId,
      timestamp: stage.startedAt,
      type: 'http.request.started',
      url: request.url,
    },
    instrumentation.reportSinkError,
  );
}

function finishFastifyRequestObservation(
  request: FastifyRequest,
  reply: FastifyReply,
  instrumentation: HttpInstrumentationContext,
  aborted: boolean,
): void {
  const observation: FastifyRequestObservation | undefined =
    readFastifyRequestObservation(request);

  if (observation === undefined) {
    return;
  }

  clearFastifyRequestObservation(request);

  emitHttpInstrumentationEvent(
    instrumentation.sinks,
    {
      aborted,
      duration: readHttpStageDuration(observation.stage),
      executionId: observation.executionId,
      headers: redactHttpHeaders(reply.getHeaders()),
      requestId: observation.requestId,
      startedAt: observation.stage.startedAt,
      statusCode: reply.statusCode,
      timestamp: Date.now(),
      type: 'http.response.sent',
    },
    instrumentation.reportSinkError,
  );
  closeHttpInstrumentationScope(request, observation.executionId);
}

function readFastifyRequestObservation(
  request: FastifyRequest,
): FastifyRequestObservation | undefined {
  return (request as FastifyRequestObservationCarrier)[
    fastifyRequestObservationSymbol
  ];
}

function writeFastifyRequestObservation(
  request: FastifyRequest,
  observation: FastifyRequestObservation,
): void {
  (request as FastifyRequestObservationCarrier)[
    fastifyRequestObservationSymbol
  ] = observation;
}

function clearFastifyRequestObservation(request: FastifyRequest): void {
  (request as FastifyRequestObservationCarrier)[
    fastifyRequestObservationSymbol
  ] = undefined;
}
