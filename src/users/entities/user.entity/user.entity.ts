import { Carga } from "src/cargas/entities/carga.entity/carga.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name: string;

    @Column()
    last_name: string;

    @Column()
    company: string;

    @Column({unique: true})
    mail: string

    @Column()
    password: string

    @OneToMany(() => User, (user) => user.id)
    cargas: Carga[]
}
