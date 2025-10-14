import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateRateDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    value?: number;
}