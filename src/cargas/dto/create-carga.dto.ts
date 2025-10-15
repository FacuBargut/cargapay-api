import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class CreateCargaDto{   
    @IsNumber()
    @IsPositive()
    code: number;
  
    @IsNumber()
    @Min(0)
    cantidad_bocas: number;
  
    @IsOptional()
    @IsDateString() // Valida que sea un string de fecha válido (ej: '2025-10-15')
    fecha_creacion?: Date;
}