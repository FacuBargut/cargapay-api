import { IsEnum, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoInstruccion } from '../entities/movement.entity/instruction.entity';


// DTOs parciales para la actualización
class UpdateViajeDto { 
    localidad_destino: string;
    cant_km: number;
    changarin: boolean;
    tipo: string;
 }
class UpdateEstadiaDto {
    horas_estadia: number;
  }

export class UpdateInstructionDto {
    @IsOptional()
    @IsEnum(TipoInstruccion)
    tipo?: TipoInstruccion;

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateViajeDto)
    viaje?: UpdateViajeDto;
    
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateEstadiaDto)
    estadia?: UpdateEstadiaDto;
}