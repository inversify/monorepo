import { type Prisma } from '../../../../generated/prisma/client.js';

export const planInclude = {
  bindings: {
    include: {
      dependencies: {
        orderBy: [{ kind: 'asc' }, { position: 'asc' }],
      },
    },
  },
  services: {
    include: {
      serviceBindings: {
        orderBy: { position: 'asc' },
      },
      tags: {
        orderBy: { position: 'asc' },
      },
    },
  },
} satisfies Prisma.PlanInclude;

export type PrismaPlanWithGraph = Prisma.PlanGetPayload<{
  include: typeof planInclude;
}>;

export const stagePlanInclude = {
  plan: {
    include: planInclude,
  },
} satisfies Prisma.ControllerInclude;

export type PrismaControllerWithPlan = Prisma.ControllerGetPayload<{
  include: typeof stagePlanInclude;
}>;

export type PrismaGuardWithPlan = Prisma.GuardGetPayload<{
  include: typeof stagePlanInclude;
}>;

export type PrismaInterceptorWithPlan = Prisma.InterceptorGetPayload<{
  include: typeof stagePlanInclude;
}>;

export type PrismaMiddlewareWithPlan = Prisma.MiddlewareGetPayload<{
  include: typeof stagePlanInclude;
}>;

export type PrismaPipeWithPlan = Prisma.PipeGetPayload<{
  include: typeof stagePlanInclude;
}>;
