import { User } from "../../users/entities/user.entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('rates')
@Unique(["name", "user"])
export class Rate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'jsonb', 
        nullable: true,
    })
    configuracion_escalonada?: {
        niveles: { desde: number; hasta: number; monto: number }[]
    };
    
    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    value: number | null;
    
    @ManyToOne(() => User)
    user: User;
}