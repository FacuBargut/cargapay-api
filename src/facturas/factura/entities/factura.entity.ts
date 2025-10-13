import { Carga } from "../../../cargas/entities/carga.entity/carga.entity";
import { User } from "../../../users/entities/user.entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


export enum EstadoFactura {
    PENDIENTE = 'pendiente',
    FINALIZADA = 'finalizada',
}

@Entity('facturas')
export class Factura {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    periodo: string;

    @CreateDateColumn()
    fecha_emision: Date;
    
    @Column('decimal', { precision: 10, scale: 2 })
    monto_total: number;
    
    @Column({ type: 'enum', enum: EstadoFactura, default: EstadoFactura.PENDIENTE })
    estado: EstadoFactura;
    
    @ManyToOne(() => User)
    user: User;
    
    @OneToMany(() => Carga, (carga) => carga.factura)
    cargas: Carga[];
}