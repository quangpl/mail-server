import { Injectable } from '@nestjs/common';
import * as aws from '@aws-sdk/client-ses';
import * as nodemailer from 'nodemailer';
import Mailer from 'nodemailer/lib/mailer';
import { config } from 'dotenv';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mail } from './schemas';
config();

@Injectable()
export class AppService {
  constructor(@InjectModel(Mail.name) private mailModel: Model<Mail>) {}
  getHello(): string {
    return 'Hello World!';
  }
  async login(username, password) {
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return process.env.ADMIN_SECRET;
    }
    return '';
  }
  async getAllMails() {
    return this.mailModel.find().lean();
  }

  async sendEmail(options: Mailer.Options) {
    //TODO: temp solution, need to pass config file instead.
    const ses = new aws.SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_ACCESS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
      },
    });
    const transporter = nodemailer.createTransport({
      SES: { ses, aws },
    });
    try {
      const info = await transporter.sendMail({
        ...options,
        from: process.env.AWS_EMAIL || 'bot@gmail.com',
      });
      await this.mailModel.create({
        to: options.to,
        from: options.from,
        sender: options.sender,
        subject: options.subject,
        text: options.text,
        html: options.html,
        priority: options.priority,
      });
      console.log(`Sent email successfully ${JSON.stringify(info.messageId)}`);
    } catch (err) {
      console.error(`Cannot send email with reason ${JSON.stringify(err)}`);
    }
  }
}
