import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';


import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!, {
      dbName: process.env.MONGO_NAME,
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {
  /* constructor(){
    console.log(process.env.MONGO_URI);
  }  */
}
