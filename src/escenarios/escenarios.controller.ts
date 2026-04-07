import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EscenariosService } from './escenarios.service';
import { AleatorioDto } from './dto/aleatorio.dto';


@Controller('escenarios')
export class EscenariosController {
  constructor(private readonly escenariosService: EscenariosService) {}

  

  @Get()
  findAll(@Query() aleatorioDto:AleatorioDto) {
    return this.escenariosService.generarNumeroAleatorio(aleatorioDto);
  }
}
