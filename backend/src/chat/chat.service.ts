import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Conversation.name)
        private conversationModel: Model<ConversationDocument>,
        @InjectModel(Message.name)
        private messageModel: Model<MessageDocument>,
    ) { }

    async sendMessage(senderId: string, recipientId: string, content: string) {
        let conversation = await this.conversationModel.findOne({
            participants: { $all: [senderId, recipientId] },
        });

        if (!conversation) {
            conversation = new this.conversationModel({
                participants: [senderId, recipientId],
            });
            await conversation.save();
        }

        const message = new this.messageModel({
            sender: senderId,
            conversation: conversation._id,
            content,
        });
        await message.save();

        conversation.lastMessage = message;
        await conversation.save();

        return message.populate('sender');
    }

    async getConversations(userId: string) {
        return this.conversationModel
            .find({ participants: userId })
            .populate('participants', '-password')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'username' },
            })
            .sort({ updatedAt: -1 })
            .exec();
    }

    async getMessages(conversationId: string) {
        return this.messageModel
            .find({ conversation: conversationId })
            .populate('sender', 'username')
            .sort({ createdAt: 1 })
            .exec();
    }

    async createConversation(userId: string, recipientId: string) {
        let conversation = await this.conversationModel.findOne({
            participants: { $all: [userId, recipientId] },
        });

        if (!conversation) {
            conversation = new this.conversationModel({
                participants: [userId, recipientId],
            });
            await conversation.save();
        }
        return conversation.populate('participants', '-password');
    }
}
