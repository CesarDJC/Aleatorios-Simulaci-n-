import { Type } from "class-transformer";
import { IsNumber, IsPositive, Max, max, Min } from "class-validator";

export class AleatorioDto{

    @IsNumber()
    @IsPositive()
    @Type(()=>Number)
    horas:number;

    @IsNumber()
    @IsPositive()
    @Type(()=>Number)
    promedioClientes:number;

    @IsNumber()
    @IsPositive()
    @Type(()=>Number)
    promedioProductos:number;


    @IsNumber()
    @IsPositive()
    @Type(()=>Number)
    @Min(0.1)
    @Max(0.9)
    ganaciaProductos:number;

}
