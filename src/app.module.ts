import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EscenariosModule } from './escenarios/escenarios.module';

@Module({
  imports: [EscenariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
