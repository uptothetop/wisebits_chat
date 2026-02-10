import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Message } from './message.schema';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    participants: User[];

    @Prop({ type: Types.ObjectId, ref: 'Message' })
    lastMessage?: Message;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
