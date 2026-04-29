import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SimulacionService } from './simulacion.service';
import { CreateSimulacionDto } from './dto/create-simulacion.dto';
import { UpdateSimulacionDto } from './dto/update-simulacion.dto';

@Controller('simulacion')
export class SimulacionController {
  constructor(private readonly simulacionService: SimulacionService) {}

  @Post()
  create(@Body() createSimulacionDto: CreateSimulacionDto) {
    return this.simulacionService.create(createSimulacionDto);
  }

  @Get()
  findAll() {
    return this.simulacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.simulacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSimulacionDto: UpdateSimulacionDto) {
    return this.simulacionService.update(+id, updateSimulacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.simulacionService.remove(+id);
  }
}
