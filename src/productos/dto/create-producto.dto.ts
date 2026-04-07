import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateProductoDto {

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    nombre:string;
    
    @IsNumber()
    @IsOptional()  
    costoOperativo?:number;
    
    @IsNumber()
    precioCosto:number;
}
