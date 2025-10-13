import { Carga } from "../../../cargas/entities/carga.entity/carga.entity";
import { Estadia } from "../../../estadias/entities/estadia/estadia";
import { Viaje } from "../../../viajes/entities/viaje/viaje";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum TipoInstruccion{
    VIAJE = 'viaje',
    ESTADIA = 'estadia'
}
@Entity()
export class Instruction {

    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({
      type: 'enum',
      enum: TipoInstruccion,
    })
    tipo: TipoInstruccion;
  
    @ManyToOne(() => Carga, (carga) => carga.instructions)
    carga: Carga;

    @OneToOne(() => Viaje, (viaje) => viaje.instruction, { cascade: true, nullable: true })
    @JoinColumn()
    viaje?: Viaje;

    @OneToOne(() => Estadia, (estadia) => estadia.instruction, { cascade: true, nullable: true })
    @JoinColumn()
    estadia?: Estadia;
}
