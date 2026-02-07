import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
export declare class ChatService {
    private conversationModel;
    private messageModel;
    constructor(conversationModel: Model<ConversationDocument>, messageModel: Model<MessageDocument>);
    sendMessage(senderId: string, recipientId: string, content: string): Promise<Omit<import("mongoose").Document<unknown, {}, MessageDocument, {}, {}> & Message & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getConversations(userId: string): Promise<(import("mongoose").Document<unknown, {}, ConversationDocument, {}, {}> & Conversation & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getMessages(conversationId: string): Promise<(import("mongoose").Document<unknown, {}, MessageDocument, {}, {}> & Message & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createConversation(userId: string, recipientId: string): Promise<Omit<import("mongoose").Document<unknown, {}, ConversationDocument, {}, {}> & Conversation & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
}
