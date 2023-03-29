import http from 'http';
import { readFileSync } from 'fs';
import express from "express";
import jwt from 'jsonwebtoken';
import { ApolloServer, ExpressContext } from "apollo-server-express";
import { JwtPayload, Resolvers } from './__generated__/resolvers-types';
import { authResolvers } from './auth/auth.resolvers';

export interface MyContext extends ExpressContext {
    currentUser: JwtPayload;
    authorized: boolean
}

export class AppModule {
    constructor(public resolvers: Resolvers) { }

    async startApollo(): Promise<{ httpServer: http.Server, server: ApolloServer<MyContext> }> {
        const typeDefs = readFileSync('schema.graphql', { encoding: 'utf-8' });

        const app = express();

        const httpServer = http.createServer(app)

        const server = new ApolloServer({
            resolvers: this.resolvers,
            typeDefs,
            context: ({ req, res }) => {
                if (!req.headers.authorization) {
                    return {
                        currentuser: null,
                        req,
                        authorized: false
                    }
                }

                const payload = jwt.verify(
                    req.headers.authorization,
                    process.env.JWT_KEY!,
                )
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

export const appModule = new AppModule(authResolvers)