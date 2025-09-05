import { Controller, Get, Module } from '@nestjs/common';

@Controller()
class AppController {
  @Get()
  public ok(): string {
    return 'ok';
  }
}

@Module({
  controllers: [AppController],
})
export class BasicGetAppModule {}
