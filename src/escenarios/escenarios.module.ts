import { Module } from '@nestjs/common';
import { EscenariosService } from './escenarios.service';
import { EscenariosController } from './escenarios.controller';
import { ProductosModule } from 'src/productos/productos.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Simulacion } from 'src/simulacion/entities/simulacion.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { ProductosService } from 'src/productos/productos.service';

@Module({
  imports:[TypeOrmModule.forFeature([Simulacion,Producto])],
  controllers: [EscenariosController],
  providers: [EscenariosService, ProductosService],
})
export class EscenariosModule {}
