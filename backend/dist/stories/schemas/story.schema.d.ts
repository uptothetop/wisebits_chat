import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
export type StoryDocument = Story & Document;
export declare class Story {
    user: User;
    mediaUrl: string;
    type: string;
    createdAt: Date;
}
export declare const StorySchema: import("mongoose").Schema<Story, import("mongoose").Model<Story, any, any, any, Document<unknown, any, Story, any, {}> & Story & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Story, Document<unknown, {}, import("mongoose").FlatRecord<Story>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Story> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
