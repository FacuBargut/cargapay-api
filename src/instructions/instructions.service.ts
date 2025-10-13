import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Instruction, TipoInstruccion } from './entities/movement.entity/instruction.entity';
import { Repository } from 'typeorm';
import { Carga, EstadoCarga } from '../cargas/entities/carga.entity/carga.entity';
import { CreateInstructionDto } from './dto/create-instruction';
import { User } from '../users/entities/user.entity/user.entity';
import { Viaje } from '../viajes/entities/viaje/viaje';
import { Estadia } from '../estadias/entities/estadia/estadia';
import { UpdateInstructionDto } from './dto/update-instruction';

@Injectable()
export class InstructionsService {
    constructor(@InjectRepository(Instruction) private _instructionRepository: Repository<Instruction>,
    @InjectRepository(Carga) private _cargaRepository: Repository<Carga>
    ){}

    async create(createInstructionDto: CreateInstructionDto, user: User){
        const carga = await this._cargaRepository.findOne({where: {id: createInstructionDto.cargaId}, relations:['user'] })

        if(!carga){
            throw new Error('Carga no encontrada')
        }

        if(carga.user.id !== user.id){
            throw new Error('El usuario no es el dueño de la carga')
        }

        if (carga.estado === EstadoCarga.FINALIZADA) {
            throw new ForbiddenException('No se pueden agregar instrucciones a una carga finalizada.');
        }

        const instruction = new Instruction();

        instruction.tipo = createInstructionDto.tipo;
        instruction.carga = carga;

        if(instruction.tipo == TipoInstruccion.VIAJE){
            const viaje = new Viaje();
            Object.assign(viaje, createInstructionDto.viaje);
            instruction.viaje = viaje;
        }else if(instruction.tipo == TipoInstruccion.ESTADIA){
            const estadia = new Estadia();
            Object.assign(estadia, createInstructionDto.estadia);
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
    
        if (!instruction) {
            throw new NotFoundException('Instrucción no encontrada');
        }
        if (instruction.carga.user.id !== user.id) {
            throw new ForbiddenException('No tenés permiso para editar esta instrucción');
        }
        if (instruction.carga.estado === EstadoCarga.FINALIZADA) {
            throw new ForbiddenException('No se pueden editar instrucciones de una carga finalizada');
        }
    
        // Actualizamos los datos del viaje o la estadía
        if (instruction.tipo === TipoInstruccion.VIAJE && updateDto.viaje) {
            // ¡VERIFICACIÓN CLAVE!
            if (instruction.viaje) {
                Object.assign(instruction.viaje, updateDto.viaje);
            }
        } else if (instruction.tipo === TipoInstruccion.ESTADIA && updateDto.estadia) {
            // ¡VERIFICACIÓN CLAVE!
            if (instruction.estadia) {
                Object.assign(instruction.estadia, updateDto.estadia);
            }
        }
        
        return this._instructionRepository.save(instruction);
    }

}
