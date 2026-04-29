import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('productos')
export class Producto {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({type: 'varchar', length:100, unique:true})
    nombre:string;

    @Column({type: 'decimal', precision:10, scale:2})
    costoOperativo?:number;

    @Column({type: 'decimal', precision:10, scale:2})
    precioCosto:number;
}
