import { Repository } from "typeorm";
import { Room } from "./entity/room.entity";
import { User } from "../../auth/user/entity/user.entity";
import { Message } from "../../__generated__/resolvers-types";
import { AppDataSource } from '../../app-data.source';


export class RoomService {
    constructor(public roomRepository: Repository<Room>) { };

    async getAllRooms(userId: number){
        const queryBuilder = this.roomRepository.createQueryBuilder('room');

        return await queryBuilder
            .innerJoin('room.users', 'u')
            .where('"u"."id" = :id', {id: userId})
            .getMany();
    };

    async addMessageToRoom(roomId: number, message: Message) {
        const queryBuilder = this.roomRepository.createQueryBuilder();
        await queryBuilder.update(Room, {
            messages: () => `messages || '${JSON.stringify(message)}'::jsonb`
        })
            .where('id = :id', { id: roomId })
            .execute();

        return await this.roomRepository.findOne(
            { where: { id: roomId }, relations: ['users'] }
        );
    };

    async createRoom(participants: Array<User>, message: Message) {
        const room = this.roomRepository.create({
            users: participants,
            messages: [message]
        });

        return await this.roomRepository.save(room);
    };

    async findRoomWithUsersId(reciverId: number, senderId: number) {
        const queryBuilder = this.roomRepository.createQueryBuilder('room');
        const rooms = await queryBuilder
            .select()
            .innerJoin('room.users', 'u')
            .where('"u"."id" = :senderId', {senderId})
            .getMany()

        return !!rooms?.some(room => room.users.some(u => u.id === reciverId))
    }
};

export const roomService = new RoomService(AppDataSource.getRepository(Room));
