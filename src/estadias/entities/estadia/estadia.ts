

import { Instruction } from "src/instructions/entities/movement.entity/instruction.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Estadia {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 5, scale: 2 })
    horas_estadia: number;

    @OneToOne(() => Instruction, (instruction) => instruction.estadia)
    instruction: Instruction;
}
