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

  @Get('simulaciones/:numero/plana')
  async obtenerSimulacionPlana(@Param('numero') numero: string) {
    return await this.escenariosService.obtenerSimulacionPlana(parseInt(numero));
  }

  @Delete()
  remove(){
    return this.escenariosService.eliminarSimulaciones();
  }

  //  @Get('simulaciones/todas')
  // async obtenerTodasSimulaciones() {
  //   return await this.escenariosService.obtenerTodasSimulacionesAgrupadas();
  // }
}
