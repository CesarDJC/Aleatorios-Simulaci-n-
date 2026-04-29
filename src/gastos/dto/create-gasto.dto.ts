import { IsIn, IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";

const tipoGasto=['fijo', 'variable'];
export class CreateGastoDto {

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    nombre:string;

    @IsString()
    @MinLength(1)
    @IsIn(tipoGasto,{message:'El gasto debe ser fijo o variable'})
    tipo:string;
    
    @IsNumber()
    @Min(0)
    valor:number;
}
