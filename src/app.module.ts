import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { Mail, MailSchema } from './schemas';
config();

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb://root:example@localhost:27017/mail_system?authMechanism=DEFAULT&authSource=admin',
    ),
    MongooseModule.forFeature([{ name: Mail.name, schema: MailSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
