import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getConversations(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/conversation.schema").ConversationDocument, {}, {}> & import("./schemas/conversation.schema").Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createConversation(req: any, recipientId: string): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/conversation.schema").ConversationDocument, {}, {}> & import("./schemas/conversation.schema").Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getMessages(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/message.schema").MessageDocument, {}, {}> & import("./schemas/message.schema").Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
