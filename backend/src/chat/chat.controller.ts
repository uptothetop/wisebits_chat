import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('conversations')
    async getConversations(@Request() req) {
        return this.chatService.getConversations(req.user.userId);
    }

    @Post('conversations')
    async createConversation(@Request() req, @Body('recipientId') recipientId: string) {
        return this.chatService.createConversation(req.user.userId, recipientId);
    }

    @Get('conversations/:id/messages')
    async getMessages(@Param('id') id: string) {
        return this.chatService.getMessages(id);
    }
}
