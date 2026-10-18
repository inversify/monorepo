import zod from 'zod';

const MAX_SIZE: number = 20;

// eslint-disable-next-line @typescript-eslint/typedef
export const getInsightsV1Query = zod
  .object({
    page: zod.coerce.number().int().min(1).default(1),
    pageSize: zod.coerce.number().int().min(1).max(MAX_SIZE).default(MAX_SIZE),
    requestMethod: zod.string().optional(),
    requestUrlLike: zod.string().optional(),
    responseStatusCode: zod.coerce.number().int().optional(),
    sort: zod.enum(['startedAtAsc', 'startedAtDesc']).optional(),
  })
  .strict();

export type GetInsightsV1Query = zod.infer<typeof getInsightsV1Query>;
