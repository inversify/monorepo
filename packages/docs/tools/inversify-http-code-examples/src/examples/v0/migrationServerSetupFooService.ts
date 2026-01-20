import { injectable } from 'inversify';

// Begin-example
@injectable()
export class FooService {
  public get(_id: string): string {
    return 'foo';
  }

  public findAll(_limit: number): string[] {
    return ['foo', 'bar'];
  }

  public async create(_data: unknown): Promise<void> {
    await Promise.resolve();
  }

  public async delete(_id: string): Promise<void> {
    await Promise.resolve();
  }
}
// End-example
