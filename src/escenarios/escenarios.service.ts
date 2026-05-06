import { Injectable } from '@nestjs/common';
import { Random } from 'random-js';
import { AleatorioDto } from './dto/aleatorio.dto';
import { PRODUCTOS_DB } from './data/productos.data';
import { ProductosService } from 'src/productos/productos.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Simulacion } from 'src/simulacion/entities/simulacion.entity';
import { Repository } from 'typeorm';


@Injectable()
export class EscenariosService {
 
  constructor(
    private readonly productosService:ProductosService,
    @InjectRepository(Simulacion)
    private simulacionRepository:Repository<Simulacion>,
  ){

  }
  private random=new Random();
  private aleatorios=[];

  async generarNumeroAleatorio(aleatorioDto:AleatorioDto){
    const {horas,promedioClientes, promedioProductos, gananciaProductos,promedioServicio}=aleatorioDto;

    this.aleatorios=[];
    const mu=60/promedioServicio;

    for (let i=1; i<=horas; i++){
      const clienteAleatorio=this.random.integer(0,promedioClientes);

      const lambda=clienteAleatorio;

      let rho=0;
      let L=0;
      let Lq=0;
      let W=0;
      let Wq = 0;
      let estado = 'ESTABLE';

       if (lambda < mu && lambda > 0) {
      rho = lambda / mu;
      L = lambda / (mu - lambda);
      Lq = (lambda * lambda) / (mu * (mu - lambda));
      W = 1 / (mu - lambda);
      Wq = lambda / (mu * (mu - lambda));
    } else if (lambda >= mu) {
      estado = 'SATURADO';
      rho = 1;
    }

      this.aleatorios.push({
        hora: `Hora ${i}`,
        clientes: clienteAleatorio,
        lambda,
      mu: Number(mu.toFixed(2)),
      rho: Number(rho.toFixed(2)),
      L: Number(L.toFixed(2)),
      Lq: Number(Lq.toFixed(2)),
      W: Number(W.toFixed(2)),
      Wq: Number(Wq.toFixed(2)),
      estado
      });
    }
   await this.generarProductosAleatorios(promedioProductos, gananciaProductos);
  await this.guardarSimulacionEnBD(gananciaProductos);
   const totalClientes = this.aleatorios.reduce((acc, h) => acc + h.clientes, 0);
   const lambdaPromedio = totalClientes / horas;

  let rho = 0;
  let L = 0;
  let Lq = 0;
  let W = 0;
  let Wq = 0;
  let estado = 'ESTABLE';

  if (lambdaPromedio < mu && lambdaPromedio > 0) {
    rho = lambdaPromedio / mu;
    L = lambdaPromedio / (mu - lambdaPromedio);
    Lq = (lambdaPromedio ** 2) / (mu * (mu - lambdaPromedio));
    W = 1 / (mu - lambdaPromedio);
    Wq = lambdaPromedio / (mu * (mu - lambdaPromedio));
  } else if (lambdaPromedio >= mu) {
    estado = 'SATURADO';
    rho = 1;
  }

  const resumen = {
    lambdaPromedio: Number(lambdaPromedio.toFixed(2)),
    mu: Number(mu.toFixed(2)),
    rho: Number(rho.toFixed(2)),
    L: Number(L.toFixed(2)),
    Lq: Number(Lq.toFixed(2)),
    W: Number(W.toFixed(2)),
    Wq: Number(Wq.toFixed(2)),
    estado
  };

    return {
      horas: this.aleatorios,
      resumen
    }
  }

async generarProductosAleatorios(promedioProductos: number, gananciaProductos: number) {
  const productosDB = await this.productosService.findAll();

  if (!productosDB || productosDB.length === 0) {
    for (let i = 0; i < this.aleatorios.length; i++) {
      this.aleatorios[i].productosTotales = 0;
      this.aleatorios[i].desglose = [];
      this.aleatorios[i].utilidadHora = 0;
    }
    return;
  }

  for (let i = 0; i < this.aleatorios.length; i++) {
    const cantidadClientes = this.aleatorios[i].clientes;
    let acumuladoProductos = 0;
    const detalleClientes = [];
    let utilidadHora = 0;

    if (cantidadClientes > 0) {
      for (let j = 0; j < cantidadClientes; j++) {
        const cantidadTotalProductos = this.random.integer(1, promedioProductos);
        const CarritoCliente = [];
        
      
        const productosAgrupados = new Map();

        for (let k = 0; k < cantidadTotalProductos; k++) {
          const productoAleatorio = this.random.pick(productosDB);
          const precioCosto = Number(productoAleatorio.precioCosto);
          const costoOperativo = Number(productoAleatorio.costoOperativo || 0);
          const calculo = (precioCosto + costoOperativo) * (1 + gananciaProductos);
          const precioVenta = Number(calculo.toFixed(2));
          const utilidad = Number((precioVenta - (precioCosto + costoOperativo)).toFixed(2));
          utilidadHora += utilidad;

          
          if (productosAgrupados.has(productoAleatorio.id)) {
            const existente = productosAgrupados.get(productoAleatorio.id);
            existente.cantidad += 1;
            existente.utilidadTotal += utilidad;
          } else {
            productosAgrupados.set(productoAleatorio.id, {
              idProducto: productoAleatorio.id,
              nombre: productoAleatorio.nombre,
              precioCosto: precioCosto,
              CostoOperativo: costoOperativo,
              PrecioVenta: precioVenta,
              cantidad: 1,
              utilidadTotal: utilidad
            });
          }
        }

      
        let productosDelCliente = [];
        for (const [_, producto] of productosAgrupados) {
          productosDelCliente.push(producto);
          acumuladoProductos += producto.cantidad;
        }

        detalleClientes.push({
          clienteId: `Cliente ${j + 1}`,
          cantidadComprada: cantidadTotalProductos,
          desgloseCompra: productosDelCliente
        });
      }
    }

    this.aleatorios[i].productosTotales = acumuladoProductos;
    this.aleatorios[i].desglose = detalleClientes;
    this.aleatorios[i].utilidadHora = Number(utilidadHora.toFixed(2));
  }
}

async guardarSimulacionEnBD(gananciaProductos: number) {

  // 🔹 Obtener el último registro insertado correctamente
  const ultimaSimulacionArray = await this.simulacionRepository.find({
    order: { id: 'DESC' },
    take: 1
  });

  const ultimaSimulacion = ultimaSimulacionArray[0];

  let nuevoNoSimulacion = 1;

  if (ultimaSimulacion) {
    nuevoNoSimulacion =
      ultimaSimulacion.noSimulacion === 3
        ? 1
        : ultimaSimulacion.noSimulacion + 1;
  }

  console.log(`Guardando simulación N° ${nuevoNoSimulacion}`);

  // 🔹 Guardar datos
  for (let i = 0; i < this.aleatorios.length; i++) {
    const horaActual = this.aleatorios[i];
    const numeroHora = i + 1;

    if (horaActual.desglose && horaActual.desglose.length > 0) {
      for (const cliente of horaActual.desglose) {
        for (const producto of cliente.desgloseCompra) {

          const registro = this.simulacionRepository.create({
            noSimulacion: nuevoNoSimulacion,
            numeroHora: numeroHora,
            hora: new Date(),
            idProducto: producto.idProducto,
            idCliente: cliente.clienteId,
            cantidadCompra: producto.cantidad,
            ganancia: gananciaProductos,
            precioVenta: producto.PrecioVenta,
          });

          await this.simulacionRepository.save(registro);
        }
      }
    }
  }

  console.log(`Simulación N° ${nuevoNoSimulacion} guardada con éxito`);

  return nuevoNoSimulacion;
}
async obtenerSimulacionPlana(noSimulacion: number) {
  return await this.simulacionRepository.find({
    where: { noSimulacion: noSimulacion },
    relations: ['producto'],
    order: {
      hora: 'ASC',
      idCliente: 'ASC',
      id: 'ASC'
    }
  });
}

async eliminarSimulaciones(){
  await this.simulacionRepository.clear();
  return 'Simulaciones borradas con éxito';
}



}
