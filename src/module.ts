import http from 'http';
import { readFileSync } from 'fs';
import express from "express";
import jwt from 'jsonwebtoken';
import { ApolloServer, ExpressContext } from "apollo-server-express";
import { mergeResolvers } from '@graphql-tools/merge';
import { Server } from 'socket.io';
import { JwtPayload, Resolvers } from './__generated__/resolvers-types';
import { authResolvers } from './auth/auth.resolvers';
import { roomResolvers } from './rooms/room.resolvers';
import { AppDataSource } from './app-data.source';
import { Room } from './rooms/room/entity/room.entity';

export interface MyContext extends ExpressContext {
    currentUser: JwtPayload;
    authorized: boolean,
    io: Server
}

export class AppModule {
    constructor(public resolvers: Resolvers) { }

    async startApollo(): Promise<{ httpServer: http.Server, server: ApolloServer<MyContext> }> {
        const typeDefs = readFileSync('schema.graphql', { encoding: 'utf-8' });

        const appDataSoure = await AppDataSource.initialize()
        const app = express();
        const httpServer = http.createServer(app);

        const io = new Server(httpServer);
        io.on('connection', (socket) => {
            app.request.socketIo = socket
        })

        const server = new ApolloServer({
            resolvers: this.resolvers,
            typeDefs,
            context: async ({ req, res }) => {
                let payload;
                try {
                    payload = jwt.verify(
                        req.headers.authorization || '',
                        process.env.JWT_KEY!,
                    )
                } catch (err) {
                    payload = null
                };

                if (typeof payload != 'string' && payload) {
                    const rooms = await appDataSoure.manager.getRepository(Room)
                        .createQueryBuilder('room')
                        .innerJoin('room.users', 'u')
                        .where('"u"."id" = :id', { id: payload.userId })
                        .getMany();

                    const roomsIds = rooms.map(room => `${room.id}`);
                    req.socketIo?.join(roomsIds);
                }

                return {
                    currentUser: payload,
                    io,
                    req,
                    authorized: !!payload
                };
            }
        });

        await server.start()

        server.applyMiddleware({ app })

        return { httpServer, server }
    }
}

export const appModule = new AppModule(
    mergeResolvers([
        authResolvers,
        roomResolvers
    ])
)