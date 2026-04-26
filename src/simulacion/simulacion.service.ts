import { Injectable } from '@nestjs/common';
import { CreateSimulacionDto } from './dto/create-simulacion.dto';
import { UpdateSimulacionDto } from './dto/update-simulacion.dto';

@Injectable()
export class SimulacionService {
  create(createSimulacionDto: CreateSimulacionDto) {
    return 'This action adds a new simulacion';
  }

  findAll() {
    return `This action returns all simulacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} simulacion`;
  }

  update(id: number, updateSimulacionDto: UpdateSimulacionDto) {
    return `This action updates a #${id} simulacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} simulacion`;
  }
}
