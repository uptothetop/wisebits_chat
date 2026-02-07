"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conversation_schema_1 = require("./schemas/conversation.schema");
const message_schema_1 = require("./schemas/message.schema");
let ChatService = class ChatService {
    constructor(conversationModel, messageModel) {
        this.conversationModel = conversationModel;
        this.messageModel = messageModel;
    }
    async sendMessage(senderId, recipientId, content) {
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
    async getConversations(userId) {
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
    async getMessages(conversationId) {
        return this.messageModel
            .find({ conversation: conversationId })
            .populate('sender', 'username')
            .sort({ createdAt: 1 })
            .exec();
    }
    async createConversation(userId, recipientId) {
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ChatService);
//# sourceMappingURL=chat.service.js.map