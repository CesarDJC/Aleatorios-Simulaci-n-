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
    const {horas,promedioClientes, promedioProductos, ganaciaProductos,promedioServicio}=aleatorioDto;

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
   await this.generarProductosAleatorios(promedioProductos, ganaciaProductos);
  //  await this.guardarSimulacionEnBD();
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
        
        // Diccionario para agrupar productos iguales
        const productosAgrupados = new Map();

        for (let k = 0; k < cantidadTotalProductos; k++) {
          const productoAleatorio = this.random.pick(productosDB);
          const precioCosto = Number(productoAleatorio.precioCosto);
          const costoOperativo = Number(productoAleatorio.costoOperativo || 0);
          const calculo = (precioCosto + costoOperativo) * (1 + gananciaProductos);
          const precioVenta = Number(calculo.toFixed(2));
          const utilidad = Number((precioVenta - (precioCosto + costoOperativo)).toFixed(2));
          utilidadHora += utilidad;

          // Agrupar por ID de producto
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

        // Convertir el Map a arreglo y sumar al acumulado
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

async guardarSimulacionEnBD() {
  const ultimaSimulacion = await this.simulacionRepository
    .createQueryBuilder('simulacion')
    .select('MAX(simulacion.noSimulacion)', 'max')
    .getRawOne();

  let nuevoNoSimulacion = 1;
  if (ultimaSimulacion && ultimaSimulacion.max !== null) {
    nuevoNoSimulacion = ultimaSimulacion.max === 3 ? 1 : ultimaSimulacion.max + 1;
  }

  console.log(`Guardando simulación N° ${nuevoNoSimulacion}`);

  for (let i = 0; i < this.aleatorios.length; i++) {
    const horaActual = this.aleatorios[i];

    if (horaActual.desglose && horaActual.desglose.length > 0) {
      for (const cliente of horaActual.desglose) {
        for (const producto of cliente.desgloseCompra) {
          // 🔹 AHORA SÍ: cantidadCompra es la cantidad de ese producto
          const registro = this.simulacionRepository.create({
            noSimulacion: nuevoNoSimulacion,
            hora: new Date(),
            idProducto: producto.idProducto,
            idCliente: cliente.clienteId,
            cantidadCompra: producto.cantidad, // ← Aquí va la cantidad REAL
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

// async obtenerTodasSimulacionesAgrupadas() {
//   // Obtener todos los registros ordenados
//   const registros = await this.simulacionRepository.find({
//     relations: ['producto'],
//     order: {
//       noSimulacion: 'ASC',  // Primero por número de simulación
//       hora: 'ASC',          // Luego por hora
//       idCliente: 'ASC',     // Luego por cliente
//       id: 'ASC'             // Finalmente por ID
//     }
//   });

//   if (registros.length === 0) {
//     return [];
//   }

//   // Agrupar por No_Simulación
//   const simulacionesPorNumero = new Map();

//   for (const registro of registros) {
//     const numSim = registro.noSimulacion;
    
//     if (!simulacionesPorNumero.has(numSim)) {
//       simulacionesPorNumero.set(numSim, []);
//     }
//     simulacionesPorNumero.get(numSim).push(registro);
//   }

//   // Para cada número de simulación, agrupar por hora
//   const resultado = [];

//   for (const [numSim, registrosSim] of simulacionesPorNumero) {
//     // Agrupar registros por hora (misma fecha y hora)
//     const horasMap = new Map();
    
//     for (const reg of registrosSim) {
//       const horaKey = reg.hora.toISOString();
      
//       if (!horasMap.has(horaKey)) {
//         horasMap.set(horaKey, []);
//       }
//       horasMap.get(horaKey).push(reg);
//     }

//     // Construir el array de horas
//     const horasArray = [];
//     let horaIndex = 1;
    
//     for (const [_, registrosHora] of horasMap) {
//       // Agrupar por cliente dentro de esta hora
//       const clientesMap = new Map();
      
//       for (const reg of registrosHora) {
//         if (!clientesMap.has(reg.idCliente)) {
//           clientesMap.set(reg.idCliente, []);
//         }
//         clientesMap.get(reg.idCliente).push(reg);
//       }
      
//       // Construir desglose de clientes
//       const desglose = [];
//       let productosTotalesHora = 0;
//       let utilidadHora = 0;
      
//       for (const [clienteId, registrosCliente] of clientesMap) {
//         const desgloseCompra = [];
//         let cantidadCompradaCliente = 0;
        
//         for (const reg of registrosCliente) {
//           const utilidadProducto = Number(reg.utilidad || 0);
//           const precioVenta = Number(reg.precioVenta || 0);
//           const precioCosto = Number(reg.producto?.precioCosto || 0);
//           const costoOperativo = Number(reg.producto?.costoOperativo || 0);
          
//           desgloseCompra.push({
//             idProducto: reg.idProducto,
//             nombre: reg.producto?.nombre || 'Producto no encontrado',
//             precioCosto: precioCosto,
//             CostoOperativo: costoOperativo,
//             PrecioVenta: precioVenta,
//             cantidad: reg.cantidadCompra,
//             utilidadTotal: utilidadProducto * reg.cantidadCompra
//           });
          
//           cantidadCompradaCliente += reg.cantidadCompra;
//           productosTotalesHora += reg.cantidadCompra;
//           utilidadHora += utilidadProducto * reg.cantidadCompra;
//         }
        
//         desglose.push({
//           clienteId: clienteId,
//           cantidadComprada: cantidadCompradaCliente,
//           desgloseCompra: desgloseCompra
//         });
//       }
      
//       horasArray.push({
//         hora: `Hora ${horaIndex}`,
//         clientes: clientesMap.size,
//         productosTotales: productosTotalesHora,
//         desglose: desglose,
//         utilidadHora: Number(utilidadHora.toFixed(2))
//       });
      
//       horaIndex++;
//     }
    
//     resultado.push({
//       noSimulacion: numSim,
//       simulacion: horasArray
//     });
//   }
  
//   return resultado;
// }


}
