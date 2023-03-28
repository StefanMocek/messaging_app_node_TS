import { Resolvers } from "../__generated__/resolvers-types";
import {userService} from './user/user.service';
import jwt from 'jsonwebtoken'

export const authResolvers: Resolvers = {
    Mutation: {
        async signup(parent, {input}, context) {
            const user = await userService.create(input);

            const jwtToken = jwt.sign(
                {email: input.email, userId: user.id}, 
                process.env.JWT_KEY!,
                {expiresIn: '7d'}
            );

            return {user, jwt: jwtToken};
        }
    },

    Query: {
        get: () => 'Ok'
    }
}