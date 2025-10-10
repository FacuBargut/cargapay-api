

import { Factura } from "src/facturas/factura/entities/factura.entity";
import { Instruction } from "src/instructions/entities/movement.entity/instruction.entity";
import { User } from "src/users/entities/user.entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum EstadoCarga {
    ACTIVA = 'activa',
    FINALIZADA = 'finalizada',
}

@Entity()
export class Carga {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    fecha_creacion: Date;

    @Column({unique: true})
    code: string;

    @Column({
        type: 'enum',
        enum: EstadoCarga,
        default: EstadoCarga.ACTIVA,
    })
    estado: EstadoCarga;

    @Column('decimal', { precision: 10, scale: 2 }) // Permite precios como 12345.67
    valor_km_recorrido: number;

    @Column('decimal', { precision: 10, scale: 2 })
    valor_hora_estadia: number;

    @Column()
    bocas: number;

    @ManyToOne(() => User, (user) => user.cargas)
    user: User;
  
    @OneToMany(() => Instruction, (m) => m.carga)
    instructions: Instruction[];

    @ManyToOne(() => Factura, (factura) => factura.cargas, { nullable: true })
    factura?: Factura;

}
