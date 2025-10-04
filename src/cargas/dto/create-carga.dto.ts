import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateCargaDto{   
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNumber()
    @IsPositive()
    valor_km_recorrido: number;

    @IsNumber()
    @IsPositive()
    valor_hora_estadia: number;
}