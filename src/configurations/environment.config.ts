import { ConfigModule } from "@nestjs/config";
import configuration from './app.config';
import jwtConfig from "./jwt.config";

export const EnvConfig = ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration, jwtConfig],
    envFilePath: `.env.${process.env.NODE_ENV || 'development.local'}`
})
