import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Buffer } from 'buffer';
import { HydratedDocument } from 'mongoose';

export type MailDocument = HydratedDocument<Mail>;

@Schema()
export class Mail {
  @Prop()
  to: string[];

  @Prop()
  from: string;
  @Prop()
  sender: string;
  @Prop()
  subject: string;

  @Prop()
  text: string;
  @Prop()
  html: Buffer;
  @Prop()
  priority: string;
}

export const MailSchema = SchemaFactory.createForClass(Mail);
