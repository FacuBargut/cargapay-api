

import { Instruction } from "../../../instructions/entities/movement.entity/instruction.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Viaje {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    cant_km: number;

    @Column()
    localidad_destino: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'simple-array',
        default: [],
    })
    tipo: string[];

    @OneToOne(() => Instruction, (instruction) => instruction.viaje)
    instruction: Instruction;
}
