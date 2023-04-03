import { GraphQLError } from "graphql";
import { Resolvers } from "../__generated__/resolvers-types";
import { roomService } from "./room/room.service";
import { userService } from "../auth/user/user.service";


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
            }, context.io)
        },

        async createRoom(parent, { input }, context) {
            if (!context.authorized) {
                throw new GraphQLError(
                    'unauthorized',
                    { extensions: { code: 'BAD_REQUEST' } }
                )
            };

            const roomHasUsers = await roomService
                .findRoomWithUsersId(input.reciver, context.currentUser.userId);

            if (roomHasUsers) {
                throw new GraphQLError('Room already exists')
            };

            const participants = await userService.findByIds([
                input.reciver, 
                context.currentUser.userId
            ])

            return await roomService.createRoom(participants, {
                from: context.currentUser.userId,
                content: input.message
            })
        }
    },

    Query: {
        async getRooms(parent, {}, context) {
            if (!context.authorized) {
                throw new GraphQLError(
                    'unauthorized',
                    { extensions: { code: 'BAD_REQUEST' } }
                )
            };

            return await roomService.getAllRooms(context.currentUser.userId)
        }
    }
}
