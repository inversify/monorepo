// Begin-example
import { PrismaContainerModule } from '@inversifyjs/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Container, inject, injectable } from 'inversify';

import { PrismaClient, type User } from '../../generated/prisma/index.js';

@injectable()
export class UserService {
  constructor(
    @inject(PrismaClient)
    private readonly prismaClient: PrismaClient,
  ) {}

  public async createUser(
    email: string,
    name: string | null = null,
  ): Promise<User> {
    return this.prismaClient.user.create({
      data: {
        email,
        name,
      },
    });
  }
}

export async function bootstrap(): Promise<UserService> {
  const container: Container = new Container();

  container.load(
    new PrismaContainerModule({
      adapter: {
        build: (options: { connectionString: string }) => new PrismaPg(options),
      },
      options: {
        value: {
          connectionString: process.env['DATABASE_URL'] as string,
        },
      },
      PrismaClient,
    }),
  );

  container.bind(UserService).toSelf();

  return container.get(UserService);
}
// End-example
