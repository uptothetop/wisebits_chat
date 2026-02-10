import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    user: User;

    @Prop({ required: true })
    mediaUrl: string;

    @Prop({ required: true, enum: ['image', 'video'] })
    type: string;

    // Expires after 24 hours (86400 seconds)
    @Prop({ type: Date, expires: '24h', default: Date.now })
    createdAt: Date;
}

export const StorySchema = SchemaFactory.createForClass(Story);
