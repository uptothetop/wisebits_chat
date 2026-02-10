import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';

describe('ChatService', () => {
  let service: ChatService;
  let conversationModel: Model<Conversation>;
  let messageModel: Model<Message>;

  const mockConversation = {
    _id: 'conv1',
    participants: ['user1', 'user2'],
    save: jest.fn().mockResolvedValue({ _id: 'conv1' }),
    populate: jest.fn().mockReturnThis(),
  };

  const mockMessage = {
    _id: 'msg1',
    content: 'hello',
    save: jest.fn().mockResolvedValue({ _id: 'msg1' }),
    populate: jest.fn().mockReturnThis(),
  };

  const mockConversationModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    new: jest.fn().mockReturnValue(mockConversation),
    constructor: jest.fn().mockReturnValue(mockConversation),
  };
  // Mock constructor
  // function mandated for constructor usage
  function MockConvModel(this: any, dto: unknown) {
    this.data = dto;
    this.save = jest.fn().mockResolvedValue(this.data);
    this._id = 'conv1';
  }
  MockConvModel.findOne = jest.fn();
  MockConvModel.find = jest.fn();

  const mockMessageModel = {
    find: jest.fn(),
    create: jest.fn(),
    new: jest.fn().mockReturnValue(mockMessage),
  };
  // function mandated for constructor usage
  function MockMsgModel(this: any, dto: unknown) {
    this.data = dto;
    this.save = jest.fn().mockResolvedValue(this.data);
    this.populate = jest.fn().mockReturnThis();
  }
  MockMsgModel.find = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(Conversation.name),
          useValue: MockConvModel,
        },
        {
          provide: getModelToken(Message.name),
          useValue: MockMsgModel,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    conversationModel = module.get(getModelToken(Conversation.name));
    messageModel = module.get(getModelToken(Message.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should create conversation if not exists', async () => {
      jest.spyOn(MockConvModel, 'findOne').mockResolvedValue(null);
      const result = await service.sendMessage('user1', 'user2', 'hello');
      expect(MockConvModel.findOne).toHaveBeenCalled();
      // It creates new conversation
      // It creates new message
      expect(result).toBeDefined();
    });
  });
});
