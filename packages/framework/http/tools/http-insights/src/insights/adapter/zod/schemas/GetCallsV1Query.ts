import zod from 'zod';

const MAX_HTTP_STATUS_CODE: number = 599;
const MAX_SIZE: number = 20;
const MIN_HTTP_STATUS_CODE: number = 100;

// eslint-disable-next-line @typescript-eslint/typedef
export const getCallsV1Query = zod
  .object({
    page: zod.coerce.number().int().min(1).default(1),
    pageSize: zod.coerce.number().int().min(1).max(MAX_SIZE).default(MAX_SIZE),
    requestMethod: zod.string().optional(),
    requestUrlLike: zod.string().optional(),
    responseStatusCode: zod.coerce
      .number()
      .int()
      .min(MIN_HTTP_STATUS_CODE)
      .max(MAX_HTTP_STATUS_CODE)
      .optional(),
    sort: zod.enum(['startedAtAsc', 'startedAtDesc']).optional(),
  })
  .strict();

export type GetCallsV1Query = zod.infer<typeof getCallsV1Query>;
