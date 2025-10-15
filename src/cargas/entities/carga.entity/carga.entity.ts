

import { Factura } from "../../../facturas/factura/entities/factura.entity";
import { Instruction } from "../../../instructions/entities/movement.entity/instruction.entity";
import { User } from "../../../users/entities/user.entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum EstadoCarga {
    ACTIVA = 'activa',
    FINALIZADA = 'finalizada',
}

@Entity()
export class Carga {

    @PrimaryGeneratedColumn()
    id: number;


    @Column({unique: true})
    code: number;

    @Column({
        type: 'enum',
        enum: EstadoCarga,
        default: EstadoCarga.ACTIVA,
    })
    estado: EstadoCarga;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;

    @Column({ type: 'integer', default: 0 })
    cantidad_bocas: number;

    @ManyToOne(() => User, (user) => user.cargas)
    user: User;
  
    @OneToMany(() => Instruction, (m) => m.carga)
    instructions: Instruction[];

    @ManyToOne(() => Factura, (factura) => factura.cargas, { nullable: true, onDelete: 'SET NULL' })
    factura: Factura | null;

}
