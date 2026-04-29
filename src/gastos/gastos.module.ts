import { Module } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { GastosController } from './gastos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gasto } from './entities/gasto.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Gasto])],
  controllers: [GastosController],
  providers: [GastosService],
})
export class GastosModule {}
