import { ForbiddenException, Injectable, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Instruction, TipoInstruccion } from './entities/movement.entity/instruction.entity';
import { Repository } from 'typeorm';
import { Carga, EstadoCarga } from '../cargas/entities/carga.entity/carga.entity';
import { CreateInstructionDto } from './dto/create-instruction';
import { User } from '../users/entities/user.entity/user.entity';
import { Viaje } from '../viajes/entities/viaje/viaje';
import { Estadia } from '../estadias/entities/estadia/estadia';
import { UpdateInstructionDto } from './dto/update-instruction';
import { Rate } from '../rates/entities/rate.entity';


@Injectable()
export class InstructionsService {
    constructor(
        @InjectRepository(Instruction) private _instructionRepository: Repository<Instruction>,
        @InjectRepository(Carga) private _cargaRepository: Repository<Carga>,
        @InjectRepository(Rate) private _rateRepository: Repository<Rate>
    ) { }

    async create(createInstructionDto: CreateInstructionDto, user: User): Promise<Instruction> {
        const carga = await this._cargaRepository.findOne({ where: { id: createInstructionDto.cargaId }, relations: ['user'] });

        if (!carga) {
            throw new NotFoundException('Carga no encontrada');
        }
        if (carga.user.id !== user.id) {
            throw new ForbiddenException('No tenés permiso para agregar instrucciones a esta carga');
        }
        if (carga.estado === EstadoCarga.FINALIZADA) {
            throw new ForbiddenException('No se pueden agregar instrucciones a una carga finalizada.');
        }

        const instruction = new Instruction();
        instruction.tipo = createInstructionDto.tipo;
        instruction.carga = carga;

        if (instruction.tipo === TipoInstruccion.VIAJE) {
            // 2. Buscamos la tarifa actual para KM
            const tarifaKm = await this._rateRepository.findOneBy({ user: { id: user.id }, name: "Valor por km recorrido" });
            if (!tarifaKm) {
                throw new PreconditionFailedException('La tarifa "Valor por km recorrido" no está configurada.');
            }

            const viaje = new Viaje();
            Object.assign(viaje, createInstructionDto.viaje);
            // 3. Calculamos y guardamos el monto en el momento de la creación
            viaje.amount = Number(viaje.cant_km) * Number(tarifaKm.value);
            instruction.viaje = viaje;

        } else if (instruction.tipo === TipoInstruccion.ESTADIA) {
            // 2. Buscamos la tarifa actual para Horas de Estadía
            const tarifaHora = await this._rateRepository.findOneBy({ user: { id: user.id }, name: "Valor por hora de estadia" });
            if (!tarifaHora) {
                throw new PreconditionFailedException('La tarifa "Valor por hora de estadia" no está configurada.');
            }

            const estadia = new Estadia();
            Object.assign(estadia, createInstructionDto.estadia);
            // 3. Calculamos y guardamos el monto en el momento de la creación
            estadia.amount = Number(estadia.horas_estadia) * Number(tarifaHora.value);
            instruction.estadia = estadia;
        }

        return this._instructionRepository.save(instruction);
    }

    async remove(id: number, user: User): Promise<void> {
        const instruction = await this._instructionRepository.findOne({
            where: { id },
            relations: ['carga', 'carga.user'],
        });

        if (!instruction) {
            throw new NotFoundException('Instrucción no encontrada');
        }
        if (instruction.carga.user.id !== user.id) {
            throw new ForbiddenException('No tenés permiso para eliminar esta instrucción');
        }
        if (instruction.carga.estado === EstadoCarga.FINALIZADA) {
            throw new ForbiddenException('No se pueden eliminar instrucciones de una carga finalizada');
        }

        await this._instructionRepository.remove(instruction);
    }

    async update(id: number, updateDto: UpdateInstructionDto, user: User): Promise<Instruction> {
        const instruction = await this._instructionRepository.findOne({
            where: { id },
            relations: ['carga', 'carga.user', 'viaje', 'estadia'],
        });

        if (!instruction) throw new NotFoundException('Instrucción no encontrada');
        if (instruction.carga.user.id !== user.id) throw new ForbiddenException('No tenés permiso para editar esta instrucción');
        if (instruction.carga.estado === EstadoCarga.FINALIZADA) throw new ForbiddenException('No se pueden editar instrucciones de una carga finalizada');

        if (instruction.tipo === TipoInstruccion.VIAJE && updateDto.viaje && instruction.viaje) {
            // 4. Al editar, volvemos a buscar la tarifa para recalcular el monto
            const tarifaKm = await this._rateRepository.findOneBy({ user: { id: user.id }, name: "Valor por km recorrido" });
            if (!tarifaKm) throw new PreconditionFailedException('La tarifa "Valor por km recorrido" no está configurada.');

            Object.assign(instruction.viaje, updateDto.viaje);
            instruction.viaje.amount = Number(instruction.viaje.cant_km) * Number(tarifaKm.value);
        
        } else if (instruction.tipo === TipoInstruccion.ESTADIA && updateDto.estadia && instruction.estadia) {
            const tarifaHora = await this._rateRepository.findOneBy({ user: { id: user.id }, name: "Valor por hora de estadia" });
            if (!tarifaHora) throw new PreconditionFailedException('La tarifa "Valor por hora de estadia" no está configurada.');

            Object.assign(instruction.estadia, updateDto.estadia);
            instruction.estadia.amount = Number(instruction.estadia.horas_estadia) * Number(tarifaHora.value);
        }

        return this._instructionRepository.save(instruction);
    }
}