import { Module } from '@nestjs/common';
import { SimulacionService } from './simulacion.service';
import { SimulacionController } from './simulacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Simulacion } from './entities/simulacion.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Simulacion])],
  controllers: [SimulacionController],
  providers: [SimulacionService],
})
export class SimulacionModule {}
