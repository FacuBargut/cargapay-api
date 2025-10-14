

import { Instruction } from "../../../instructions/entities/movement.entity/instruction.entity";
import { Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export enum TipoEntrega {
    CAJA = 'caja',
    COLGADO = 'colgado'
}

@Entity()
export class Viaje {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    cant_km: number;

    @Column()
    localidad_destino: string;

    @Column()
    changarin: boolean;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: TipoEntrega,
    })
    tipo: TipoEntrega;

    @OneToOne(() => Instruction, (instruction) => instruction.viaje)
    instruction: Instruction;
}
