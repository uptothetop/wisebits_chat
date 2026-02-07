import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { StoriesModule } from './stories/stories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoHost = process.env.NODE_ENV === 'production' ? 'mongo' : 'localhost';
        return {
          uri: `mongodb://${configService.get<string>('MONGO_USER')}:${configService.get<string>('MONGO_PASSWORD')}@${mongoHost}:27017/chat_db?authSource=admin`,
        };
      },
      inject: [ConfigService],
    }),
    // Serve uploads (stories)
    ServeStaticModule.forRoot({
      rootPath: process.env.NODE_ENV === 'production' ? '/app/uploads' : join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    // Serve frontend in production
    ...(process.env.NODE_ENV === 'production'
      ? [
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'frontend-build'),
          exclude: ['/api*', '/uploads*', '/socket.io*'],
        }),
      ]
      : []),
    UsersModule,
    AuthModule,
    ChatModule,
    StoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
