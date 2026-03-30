import { Module } from '@nestjs/common';
import { EscenariosService } from './escenarios.service';
import { EscenariosController } from './escenarios.controller';

@Module({
  controllers: [EscenariosController],
  providers: [EscenariosService],
})
export class EscenariosModule {}
