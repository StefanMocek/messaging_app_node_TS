import http from 'http';
import { readFileSync } from 'fs';
import express from "express";
import jwt from 'jsonwebtoken';
import { ApolloServer, ExpressContext } from "apollo-server-express";
import { mergeResolvers } from '@graphql-tools/merge';
import { JwtPayload, Resolvers } from './__generated__/resolvers-types';
import { authResolvers } from './auth/auth.resolvers';
import { roomResolvers } from './rooms/room.resolvers';
import { AppDataSource } from './app-data.source';

export interface MyContext extends ExpressContext {
    currentUser: JwtPayload;
    authorized: boolean
}

export class AppModule {
    constructor(public resolvers: Resolvers) { }

    async startApollo(): Promise<{ httpServer: http.Server, server: ApolloServer<MyContext> }> {
        await AppDataSource.initialize()

        const typeDefs = readFileSync('schema.graphql', { encoding: 'utf-8' });

        const app = express();

        const httpServer = http.createServer(app)

        const server = new ApolloServer({
            resolvers: this.resolvers,
            typeDefs,
            context: ({ req, res }) => {
                let payload;
                try {
                    payload = jwt.verify(
                        req.headers.authorization || '',
                        process.env.JWT_KEY!,
                    )
                } catch (err) {
                    payload = null
                }
                return {
                    currentUser: payload,
                    req,
                    authorized: !!payload
                }
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