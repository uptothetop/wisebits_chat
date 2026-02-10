import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Query } from 'mongoose';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  const mockUser = {
    username: 'test',
    email: 'test@test.com',
    password: 'hashedPassword',
    save: jest.fn().mockResolvedValue({ username: 'test', email: 'test@test.com' }),
  };

  const mockUserModel = {
    new: jest.fn().mockResolvedValue(mockUser),
    constructor: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  // Mock implementation for the model constructor
  // function mandated for constructor usage
  function MockUserModel(this: any, dto: unknown) {
    this.data = dto;
    this.save = jest.fn().mockResolvedValue(this.data);
  }
  (MockUserModel as unknown as { find: jest.Mock }).find = jest.fn();
  (MockUserModel as unknown as { findOne: jest.Mock }).findOne = jest.fn();
  (MockUserModel as unknown as { findById: jest.Mock }).findById = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = { username: 'test', email: 'test@email.com', password: 'pw' };

      // Mock find to return empty array (no duplicate)
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as unknown as Query<UserDocument[], UserDocument>);

      // We expect the service to hash password and save
      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(result.username).toBe('test');
    });

    it('should throw error if user exists', async () => {
      const dto = { username: 'test', email: 'test@email.com', password: 'pw' };
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([dto]),
      } as unknown as Query<UserDocument[], UserDocument>);

      await expect(service.create(dto)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = { username: 'test' };
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      } as any);

      const result = await service.findOne('test');
      expect(result).toEqual(user);
    });
  });
});
