import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('gastos')
export class Gasto {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:'varchar', unique:true})
    nombre:string;

    @Column({type:'varchar', length:100})
    tipo:string;

    @Column({type:'decimal', precision:10, scale:2})
    valor:number;
}
