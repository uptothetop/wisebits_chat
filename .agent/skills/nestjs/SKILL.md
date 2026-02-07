---
name: NestJS Backend Development
description: Patterns and best practices for developing NestJS backend features in Wisebits Chat
---

# NestJS Backend Development Skill

## Overview

This skill provides guidance for developing backend features using NestJS in the Wisebits Chat project. NestJS is a progressive Node.js framework that uses TypeScript and follows enterprise-level architecture patterns.

## Project Structure

```
backend/src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── auth/                   # Authentication module
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
├── users/                  # User management module
├── chat/                   # Chat & WebSocket module
└── stories/                # Stories module
```

## Creating a New Module

### Step 1: Generate Module Structure

Use NestJS CLI or create manually:

```bash
cd backend
nest generate module feature-name
nest generate controller feature-name
nest generate service feature-name
```

Or create manually following the pattern:

**feature-name.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { FeatureNameController } from './feature-name.controller';
import { FeatureNameService } from './feature-name.service';

@Module({
  controllers: [FeatureNameController],
  providers: [FeatureNameService],
  exports: [FeatureNameService], // Export if used by other modules
})
export class FeatureNameModule {}
```

### Step 2: Register Module in AppModule

**app.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { FeatureNameModule } from './feature-name/feature-name.module';

@Module({
  imports: [
    // ... other modules
    FeatureNameModule,
  ],
})
export class AppModule {}
```

## MongoDB Integration with Mongoose

### Define Schema

**schemas/entity.schema.ts:**
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Entity extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
}

export const EntitySchema = SchemaFactory.createForClass(Entity);
```

### Register Schema in Module

```typescript
import { MongooseModule } from '@nestjs/mongoose';
import { Entity, EntitySchema } from './schemas/entity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Entity.name, schema: EntitySchema }
    ]),
  ],
  // ...
})
export class FeatureModule {}
```

### Use in Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Entity } from './schemas/entity.schema';

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(Entity.name) private entityModel: Model<Entity>
  ) {}

  async create(data: any): Promise<Entity> {
    const entity = new this.entityModel(data);
    return entity.save();
  }

  async findAll(): Promise<Entity[]> {
    return this.entityModel.find().exec();
  }

  async findById(id: string): Promise<Entity> {
    return this.entityModel.findById(id).exec();
  }

  async update(id: string, data: any): Promise<Entity> {
    return this.entityModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.entityModel.findByIdAndDelete(id).exec();
  }
}
```

## DTOs and Validation

### Create DTO

**dto/create-entity.dto.ts:**
```typescript
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateEntityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

### Enable Validation Globally

Already configured in **main.ts:**
```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error on unknown properties
    transform: true,        // Auto-transform to DTO types
  }));
  await app.listen(3000);
}
```

### Use DTO in Controller

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { CreateEntityDto } from './dto/create-entity.dto';

@Controller('entities')
export class EntityController {
  @Post()
  create(@Body() createDto: CreateEntityDto) {
    // DTO is automatically validated
    return this.entityService.create(createDto);
  }
}
```

## JWT Authentication

### Protect Routes with Guards

**controllers/entity.controller.ts:**
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('entities')
@UseGuards(JwtAuthGuard) // Protect entire controller
export class EntityController {
  @Get()
  findAll() {
    return this.entityService.findAll();
  }

  @Get('public')
  @UseGuards() // Override to make this route public
  getPublic() {
    return { message: 'Public endpoint' };
  }
}
```

### Get Current User

**decorators/current-user.decorator.ts:**
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Set by JWT strategy
  },
);
```

**Use in controller:**
```typescript
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  getProfile(@CurrentUser() user: any) {
    return { userId: user.sub, username: user.username };
  }
}
```

## Error Handling

### Standard Exceptions

```typescript
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class EntityService {
  async findById(id: string): Promise<Entity> {
    const entity = await this.entityModel.findById(id).exec();
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async create(data: CreateEntityDto): Promise<Entity> {
    try {
      const entity = new this.entityModel(data);
      return await entity.save();
    } catch (error) {
      if (error.code === 11000) { // Duplicate key
        throw new ConflictException('Entity already exists');
      }
      throw new BadRequestException('Failed to create entity');
    }
  }

  async checkOwnership(entityId: string, userId: string): Promise<void> {
    const entity = await this.findById(entityId);
    if (entity.userId.toString() !== userId) {
      throw new ForbiddenException('You do not own this entity');
    }
  }
}
```

## File Upload with Multer

### Configure Multer in Controller

```typescript
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm)$/)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      path: file.path,
      size: file.size,
    };
  }
}
```

## Testing NestJS Services

### Unit Test Example

**entity.service.spec.ts:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EntityService } from './entity.service';
import { Entity } from './schemas/entity.schema';

describe('EntityService', () => {
  let service: EntityService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = {
      new: jest.fn(),
      constructor: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      exec: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityService,
        {
          provide: getModelToken(Entity.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<EntityService>(EntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all entities', async () => {
    const entities = [{ name: 'Test' }];
    mockModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(entities),
    });

    const result = await service.findAll();
    expect(result).toEqual(entities);
  });
});
```

## Best Practices

1. **Module Organization**: One feature = one module
2. **Dependency Injection**: Always use constructor injection
3. **DTOs**: Use for all request/response data
4. **Validation**: Use class-validator decorators
5. **Error Handling**: Use NestJS built-in exceptions
6. **Guards**: Protect routes with authentication guards
7. **Testing**: Write unit tests for all services
8. **Type Safety**: Leverage TypeScript fully
9. **Async/Await**: Always use async/await, never callbacks
10. **Environment Variables**: Use ConfigModule for configuration
