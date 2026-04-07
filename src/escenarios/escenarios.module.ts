import { Module } from '@nestjs/common';
import { EscenariosService } from './escenarios.service';
import { EscenariosController } from './escenarios.controller';
import { ProductosModule } from 'src/productos/productos.module';

@Module({
  imports:[ProductosModule],
  controllers: [EscenariosController],
  providers: [EscenariosService],
})
export class EscenariosModule {}
