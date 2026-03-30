import { Injectable } from '@nestjs/common';
import { Random } from 'random-js';
import { AleatorioDto } from './dto/aleatorio.dto';
import { PRODUCTOS_DB } from './data/productos.data';


@Injectable()
export class EscenariosService {
 
  private random=new Random();
  private aleatorios=[];
  generarNumeroAleatorio(aleatorioDto:AleatorioDto){
    const {horas,promedioClientes, promedioProductos, ganaciaProductos}=aleatorioDto;

    this.aleatorios=[];

    for (let i=1; i<=horas; i++){
      const clienteAleatorio=this.random.integer(0,promedioClientes);
      this.aleatorios.push({
        hora: `Hora ${i}`,
        clientes: clienteAleatorio
      });
    }
    this.generarProductosAleatorios(promedioProductos, ganaciaProductos);

    return this.aleatorios;
  }


  generarProductosAleatorios(promedioProductos:number, gananciaProductos:number){
   
    for(let i=0; i< this.aleatorios.length; i++){
      const cantidadClientes=this.aleatorios[i].clientes;
      let acumuladoProductos=0;
      const detalleClientes=[];
      let utilidadHora=0;

      if(cantidadClientes>0){
        for(let j=0; j< cantidadClientes; j++){
          const ProductosPorCliente=this.random.integer(1,promedioProductos);
          const CarritoCliente=[];

          acumuladoProductos +=ProductosPorCliente

          for(let k=0; k<ProductosPorCliente; k++){
            const productoAleatorio=this.random.pick(PRODUCTOS_DB);
            const precioCosto=productoAleatorio.precioCosto;
            const costoOperativo=productoAleatorio.costoOperativo ||0;
            const calculo=(precioCosto+costoOperativo)*(1+gananciaProductos)
            const precioVenta=Number(calculo.toFixed(2));
            const utilidad=Number((precioVenta-(precioCosto+costoOperativo)).toFixed(2));
            utilidadHora+=utilidad;


            CarritoCliente.push({
              nombre: productoAleatorio.nombre,
              precioCosto:precioCosto,
              CostoOperativo:costoOperativo,
              PrecioVenta: precioVenta,
              Utilidad:utilidad
              
            })
          }

          detalleClientes.push({
            clienteId:`Cliente ${j+1}`,
            cantidadComprada:ProductosPorCliente,
            desgloseCompra:CarritoCliente
          })
        }
      }

      this.aleatorios[i].productosTotales=acumuladoProductos;
      this.aleatorios[i].desglose=detalleClientes;
      this.aleatorios[i].utilidadHora=Number(utilidadHora.toFixed(2));
    
    }
  }
}
