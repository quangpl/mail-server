import { Injectable } from '@nestjs/common';
import * as aws from '@aws-sdk/client-ses';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { config } from 'dotenv';
config();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async sendEmail(options: Mail.Options) {
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
      console.log(`Sent email successfully ${JSON.stringify(info.messageId)}`);
    } catch (err) {
      console.error(`Cannot send email with reason ${JSON.stringify(err)}`);
    }
  }
}
