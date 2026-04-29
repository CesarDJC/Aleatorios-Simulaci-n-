import { Producto } from 'src/productos/entities/producto.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('simulaciones')
export class Simulacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'No_Simulación', type: 'int' })
  noSimulacion: number;

  @Column({
    name: 'Hora',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  hora: Date;

  @Column({name:'Numero_Hora',type:'int', nullable:true})
  numeroHora:number;

  @Column({ name: 'Id_Producto', type: 'int' })
  idProducto: number;

  @Column({ name: 'Id_Cliente', type: 'varchar', length: 50 })
  idCliente: string;

  @Column({ name: 'Cantidad_Compra', type: 'int' })
  cantidadCompra: number;

  @Column({ name: 'Ganancia', type: 'decimal', precision: 10, scale: 2, nullable: true })
  ganancia: number;

  @Column({ name: 'Precio_Venta', type: 'decimal', precision: 10, scale: 2, nullable: true })
  precioVenta: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'Id_Producto' })
  producto: Producto;
}
