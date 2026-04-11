import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Gasto } from './entities/gasto.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GastosService {


  constructor(
    @InjectRepository(Gasto)
    private gastoRepository:Repository<Gasto>,
  ){}

  async create(createGastoDto: CreateGastoDto) {
    try {
      const gasto= this.gastoRepository.create(createGastoDto);

      await this.gastoRepository.save(gasto);

      return gasto;
    } catch (error) {
      this.repetidos(error);
    }
  }

  async findAll() {
    return this.gastoRepository.find({});
  }

  async findOne(id: number) {
    const gasto=await this.gastoRepository.findOne({where: {id}});

    if(!gasto){
      throw new NotFoundException('El gasto con ese id no existe');
    }
    return gasto;
  }

  async update(id: number, updateGastoDto: UpdateGastoDto) {
    
    try {
      const gasto=await this.findOne(id);
      Object.assign(gasto,updateGastoDto);
      await this.gastoRepository.save(gasto);

      return gasto

    } catch (error) {
      this.repetidos(error);
    }
    
  }

 async remove(id: number) {
    const gasto=await this.findOne(id);

    await this.gastoRepository.remove(gasto);

    return 'producto eliminado';
  }


  async gastosHora(){
    const gastos=await this.gastoRepository.createQueryBuilder('gastos')
    .select('SUM(gastos.valor)','total')
    .getRawOne();

    const gastosDia=gastos.total/6;
    const gastosHora=gastosDia/24;
    return Number(gastosHora);
  }

  repetidos(error:any){
    if(error.code==='23505'){
      throw new BadRequestException('El producto ya existe')
    }
    throw error;
  }



}
