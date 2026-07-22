import { Controller, Get, Module } from '@nestjs/common';

@Controller()
class AppController {
  @Get()
  public async ok(): Promise<string> {
    return 'ok';
  }
}

@Module({
  controllers: [AppController],
})
export class BasicGetAppModule {}
