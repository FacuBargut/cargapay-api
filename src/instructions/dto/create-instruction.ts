import { IsEnum, IsNumber, ValidateNested, ValidateIf, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoInstruccion } from '../entities/movement.entity/instruction.entity';
import { CreateViajeDto } from 'src/viajes/dto/create-dto';
import { CreateEstadiaDto } from 'src/estadias/dto/estadia-dto';


export class CreateInstructionDto {
    @IsNumber()
    cargaId: number;

    @IsEnum(TipoInstruccion)
    tipo: TipoInstruccion;

    @ValidateIf(o => o.tipo === TipoInstruccion.VIAJE)
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateViajeDto)
    viaje?: CreateViajeDto;

    @ValidateIf(o => o.tipo === TipoInstruccion.ESTADIA)
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateEstadiaDto)
    estadia?: CreateEstadiaDto;
}