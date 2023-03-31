import { GraphQLError } from "graphql";
import { Resolvers } from "../__generated__/resolvers-types";


export const roomResolvers: Resolvers = {
    Mutation: {
        async sendMsg (parent, {input}, context) {
            if(!context.authorized) {
                throw new GraphQLError(
                    'unauthorized',
                    {extensions: {code: 'BAD_REQUEST'}}    
                )
            }
            return {
                id: input.roomId,
                users: [],
                messages: [{from: 1, content: input.message}]
            }
        }
    }
}
