import * as dotenv from 'dotenv'
dotenv.config()
import { appModule } from "./module";
import 'reflect-metadata';

const bootstrap = async () => {
    if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY is required')
    }
    
    const {httpServer, server} = await appModule.startApollo();

    httpServer.listen(4000, () => {
        console.log('server is ready at: http://localhost:4000' + server.graphqlPath);
    })
}

bootstrap()