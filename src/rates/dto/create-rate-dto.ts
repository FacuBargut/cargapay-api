import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateRateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsPositive()
    value: number;
}