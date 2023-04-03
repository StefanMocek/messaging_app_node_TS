import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { IsEmail, MinLength } from 'class-validator';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column({ nullable: false, unique: true })
    @IsEmail()
    email: string

    @Column()
    @MinLength(6)
    password: string
}