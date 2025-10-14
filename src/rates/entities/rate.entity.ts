import { User } from "../../users/entities/user.entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('rates')
@Unique(["name", "user"])
export class Rate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    
    @Column('decimal', { precision: 10, scale: 2 })
    value: number;
    
    @ManyToOne(() => User)
    user: User;
}