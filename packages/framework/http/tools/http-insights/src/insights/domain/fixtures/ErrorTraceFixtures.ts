import { type ErrorTrace } from '../models/ErrorTrace.js';

export class ErrorTraceFixtures {
  public static get any(): ErrorTrace {
    return {
      location: {
        column: 3,
        file: '/app/src/handler.ts',
        filename: 'handler.ts',
        functionName: 'handle',
        line: 12,
      },
      nextStatements: ['return value;'],
      previousStatements: ['const value = read();', 'validate(value);'],
      traceStatement: 'throw new Error(value);',
    };
  }
}
