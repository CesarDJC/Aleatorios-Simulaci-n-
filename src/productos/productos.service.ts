import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {

  constructor(
    @InjectRepository(Producto)
    private productoRepository:Repository<Producto>,
    
  ){}



  async create(createProductoDto: CreateProductoDto) {
    try {
      let {costoOperativo,...restoProductos}=createProductoDto;

      if(!costoOperativo){
        costoOperativo=0;
        
      }
      const producto=this.productoRepository.create({
        costoOperativo:costoOperativo,
        ...restoProductos
      });

      await this.productoRepository.save(producto);
      return producto;

    } catch (error) {
      this.repetidos(error);
    }
  }

  async findAll() {
    return await this.productoRepository.find({});
  }

  async findOne(id: number) {
    const producto=await this.productoRepository.findOne({where:{id}});
    if(!producto){
      throw new NotFoundException('No hay productos en la base de datos');
    }

    return producto;

  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    
    try {
      const producto=await this.findOne(id);

      if(!producto){
        throw new NotFoundException('El producto no existe en la base de datos');
      }

      Object.assign(producto, updateProductoDto);
      await this.productoRepository.save(producto);
      return producto;
    } catch (error) {
      this.repetidos(error);
    }
  }

  async remove(id: number) {
    const producto=await this.findOne(id);
    if(!producto){
      throw new NotFoundException('El producto no está en la base de datos');
      
    }
    await this.productoRepository.remove(producto);
    return 'Producto eliminado con éxito';
  }

  repetidos(error:any){
    if(error.code==='23505'){
      throw new BadRequestException('El producto ya existe');
    }
    throw error;
  }
}
