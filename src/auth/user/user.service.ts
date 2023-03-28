import { Repository } from "typeorm";
import bcrypt from 'bcrypt';
import { User } from "./entity/user.entity";
import {SignupInput} from '../../__generated__/resolvers-types'
import {AppDataSource} from '../../app-data.source'

export class UserService {
    constructor(public userRepository: Repository<User>) {}

    async create (signupInput: SignupInput) {
        const password = await bcrypt.hash(signupInput.password, 10);
        const user = this.userRepository.create({...signupInput, password});
        
        return await this.userRepository.save(user);
    };

    async findOneByEmail(email:string) {
        return await this.userRepository.findOneBy({email})
    }
};

export const userService = new UserService(AppDataSource.getRepository(User))