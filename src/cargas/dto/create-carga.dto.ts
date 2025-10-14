import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCargaDto{   
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNumber()
    @IsNotEmpty()
    cantidad_bocas: number;
}