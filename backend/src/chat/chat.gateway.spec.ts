import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  const mockChatService = {
    sendMessage: jest.fn(),
  };
  const mockUsersService = {
    findOne: jest.fn(),
    findById: jest.fn(),
  };
  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
