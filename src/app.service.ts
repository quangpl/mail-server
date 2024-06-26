import { Injectable } from '@nestjs/common';
import * as aws from '@aws-sdk/client-ses';
import * as nodemailer from 'nodemailer';
import Mailer from 'nodemailer/lib/mailer';
import { config } from 'dotenv';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mail } from './schemas';
config();
const LIMIT_MAIL = 50;
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

  async sendEmail(options: Mailer.Options, files: Array<Express.Multer.File>) {
    console.log(options);
    options.to = JSON.parse(options.to as any);

    //TODO: temp solution, need to pass config file instead.
    const ses = new aws.SES({
      apiVersion: '2010-12-01',
      region: process.env.AWS_ACCESS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
      },
    });
    let transporter;
    if (process.env.NODE_ENV === 'dev') {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        SES: { ses, aws },
      });
    }

    try {
      const attachments = [];
      for (const file of files) {
        attachments.push({
          filename: file.originalname,
          content: file.buffer,
        });
      }

      for (let i = 0; i < (options.to as any[]).length; i = i + LIMIT_MAIL) {
        console.log((options.to as string[]).slice(i, i + LIMIT_MAIL));
        const info = await transporter.sendMail({
          ...options,
          from: process.env.AWS_EMAIL || 'system@vnucfs.com',
          html: options.html,
          attachments,
          to: (options.to as string[]).slice(i, i + LIMIT_MAIL),
        });
        console.log(info);
        await new Promise((r) => setTimeout(r, 4000));
      }
      await this.mailModel.create({
        to: options.to,
        from: options.from,
        sender: options.sender,
        subject: options.subject,
        text: options.text,
        html: options.html,
        time: Date.now(),
      });
      console.log(`Sent email successfully`);
    } catch (err) {
      console.error(`Cannot send email with reason ${JSON.stringify(err)}`);
    }
  }
}
