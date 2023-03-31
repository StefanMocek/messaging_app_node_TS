import { Room } from "../../../rooms/room/entity/room.entity";
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column({nullable: false, unique: true})
    email:string

    @Column()
    password:string

    @ManyToMany(() => Room, (room) => room.users)
    @Column()
    rooms: Room[]
}