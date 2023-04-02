import { GraphQLError } from "graphql";
import { Resolvers } from "../__generated__/resolvers-types";
import { roomService } from "./room/room.service";


export const roomResolvers: Resolvers = {
    Mutation: {
        async sendMsg(parent, { input }, context) {
            if (!context.authorized) {
                throw new GraphQLError(
                    'unauthorized',
                    { extensions: { code: 'BAD_REQUEST' } }
                )
            };

            return await roomService.addMessageToRoom(input.roomId, {
                content: input.message,
                from: context.currentUser.userId
            })
        },

        async createRoom(parent, { input }, context) {
            if (!context.authorized) {
                throw new GraphQLError(
                    'unauthorized',
                    { extensions: { code: 'BAD_REQUEST' } }
                )
            };
        }
    }
}
