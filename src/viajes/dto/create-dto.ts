import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';
export class CreateViajeDto {
    @IsString()
    @IsNotEmpty()
    origen: string;

    @IsString()
    @IsNotEmpty()
    destino: string;

    @IsNumber()
    @IsPositive()
    kilometros: number;
}