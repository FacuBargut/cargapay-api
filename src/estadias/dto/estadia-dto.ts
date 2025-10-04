import { IsNumber, IsPositive } from "class-validator";


export class CreateEstadiaDto {
    @IsNumber()
    @IsPositive()    
    horas_estadia: number;
 }