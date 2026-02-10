---
name: Security Best Practices
description: Security patterns and testing for the Wisebits Chat application
---

# Security Best Practices Skill

## Overview

This skill covers security best practices specific to the Wisebits Chat project, including authentication, authorization, XSS protection, input validation, and security testing.

## Authentication Security

### JWT Token Management

**Secure token generation:**
```typescript
// backend/src/auth/auth.service.ts
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto) {
    // Hash password with strong salt rounds
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    
    // Store hashed password, never plain text
    const user = await this.userModel.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate token with limited payload
    return {
      access_token: this.jwtService.sign({
        sub: user._id,
        username: user.username,
        // Never include sensitive data like password
      }),
    };
  }

  async validatePassword(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
```

**Token validation:**
```typescript
// backend/src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

### Frontend Token Storage

**Secure storage:**
```typescript
// frontend/src/lib/stores.ts
import { writable } from 'svelte/store';

export const authToken = writable<string | null>(
  localStorage.getItem('token') // Use httpOnly cookies in production
);

// Auto-persist token
authToken.subscribe((token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
});

// Clear token on logout
export function logout() {
  authToken.set(null);
  // Clear all sensitive data
  localStorage.clear();
}
```

> ⚠️ **Production Note**: For production, use httpOnly cookies instead of localStorage to prevent XSS attacks from stealing tokens.

## XSS Protection

### Input Sanitization

**Backend validation:**
```typescript
// backend/src/auth/dto/register.dto.ts
import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores, and hyphens',
  })
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
```

**Message content validation:**
```typescript
// backend/src/chat/dto/create-message.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  content: string;
}
```

**Frontend escaping:**
```svelte
<!-- frontend/src/lib/components/Message.svelte -->
<script lang="ts">
  export let content: string;
  
  // Svelte automatically escapes HTML in text interpolation
  // But be careful with {@html ...} - never use with user content
</script>

<!-- Safe: Svelte escapes this automatically -->
<p>{content}</p>

<!-- DANGEROUS: Never do this with user input -->
<!-- {@html content} -->
```

### Content Security Policy

**Add CSP headers (in production):**
```typescript
// backend/src/main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  }));
  
  await app.listen(3000);
}
```

## Authorization

### Resource Ownership Verification

**Verify user owns resource:**
```typescript
// backend/src/chat/chat.service.ts
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@Injectable()
export class ChatService {
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageModel.findById(messageId);
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    
    // Check ownership
    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }
    
    await message.deleteOne();
  }

  async accessConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    
    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );
    
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }
    
    return conversation;
  }
}
```

## File Upload Security

### Validate File Types and Size

**Backend validation:**
```typescript
// backend/src/stories/stories.controller.ts
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('stories')
export class StoriesController {
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/stories',
        filename: (req, file, cb) => {
          // Generate secure random filename
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Whitelist allowed MIME types
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'video/webm',
        ];
        
        if (!allowedMimes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Invalid file type. Only images and videos allowed.'),
            false
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
      },
    }),
  )
  async uploadStory(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    // Additional validation on file extension
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm'];
    const ext = extname(file.originalname).toLowerCase();
    
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException('Invalid file extension');
    }
    
    return this.storiesService.create(user.sub, file.path);
  }
}
```

## Database Security

### Prevent NoSQL Injection

**Use Mongoose with validation:**
```typescript
// Always use DTOs with class-validator
// Never pass raw user input to database queries

// ❌ VULNERABLE:
async findUser(username: any) {
  return this.userModel.findOne({ username });
  // If username = { $ne: null }, returns all users
}

// ✅ SAFE:
async findUser(username: string) {
  // DTO validates username is a string
  return this.userModel.findOne({ username });
}
```

**Sanitize query parameters:**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class FindUserDto {
  @IsString()
  @IsNotEmpty()
  username: string; // Ensures it's a string, not an object
}
```

## Rate Limiting

### Prevent Brute Force Attacks

**Add rate limiting:**
```typescript
// backend/src/main.ts
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    })
  );
  
  await app.listen(3000);
}
```

**Specific endpoint rate limiting:**
```typescript
// backend/src/auth/auth.controller.ts
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle(5, 60) // 5 attempts per minute
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

## CORS Configuration

**Restrict origins:**
```typescript
// backend/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:5173',  // Dev frontend
      'http://localhost:4173',  // Preview frontend
      // Add production domain here
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(3000);
}
```

## Security Testing

### BDD Security Scenarios

**Test XSS protection:**
```gherkin
# bdd/security.feature
Feature: Security
  As a security-conscious user
  I want the application to protect against common attacks
  So that my data remains safe

  @security
  Scenario: XSS protection in messages
    Given I am logged in as "alice"
    When I send a message "<script>alert('xss')</script>"
    Then the message should be displayed as plain text
    And no JavaScript should execute

  @security
  Scenario: SQL injection protection in search
    Given I am logged in as "alice"
    When I search for users with query "'; DROP TABLE users; --"
    Then I should see a safe search result
    And the database should remain intact

  @security
  Scenario: Unauthorized conversation access
    Given user "alice" has a conversation with "bob"
    And I am logged in as "charlie"
    When I try to access alice and bob's conversation
    Then I should see a "403 Forbidden" error
```

### Unit Tests for Security

**Test authorization:**
```typescript
// backend/src/chat/chat.service.spec.ts
describe('ChatService - Security', () => {
  it('should prevent unauthorized message deletion', async () => {
    const message = await service.createMessage({
      conversationId: 'conv1',
      senderId: 'user1',
      content: 'Test',
    });

    // Try to delete as different user
    await expect(
      service.deleteMessage(message.id, 'user2')
    ).rejects.toThrow(ForbiddenException);
  });

  it('should prevent access to other users conversations', async () => {
    const conversation = await service.createConversation('user1', 'user2');

    // Try to access as different user
    await expect(
      service.accessConversation(conversation.id, 'user3')
    ).rejects.toThrow(ForbiddenException);
  });
});
```

**Test XSS protection:**
```typescript
// backend/src/auth/auth.service.spec.ts
describe('AuthService - XSS Protection', () => {
  it('should sanitize username with HTML', async () => {
    const maliciousUsername = '<script>alert("xss")</script>';
    
    await expect(
      service.register({
        username: maliciousUsername,
        email: 'test@example.com',
        password: 'password123',
      })
    ).rejects.toThrow(); // Validation should fail
  });
});
```

## Security Checklist

Before deploying or marking a task complete, verify:

- [ ] All endpoints are protected with appropriate guards
- [ ] User input is validated using DTOs
- [ ] Passwords are hashed with bcrypt (salt rounds >= 10)
- [ ] JWT tokens have reasonable expiration times
- [ ] File uploads validate MIME type and size
- [ ] Database queries use DTOs to prevent injection
- [ ] CORS is configured with specific origins
- [ ] Rate limiting is enabled on sensitive endpoints
- [ ] XSS protection tests pass
- [ ] Authorization tests pass
- [ ] No sensitive data is logged or exposed in responses
- [ ] Error messages don't leak system information

## Best Practices

1. **Never trust user input**: Always validate and sanitize
2. **Principle of least privilege**: Users should only access their own resources
3. **Defense in depth**: Multiple layers of security
4. **Fail securely**: Default to denying access
5. **Keep dependencies updated**: Regularly update packages
6. **Use environment variables**: Never hardcode secrets
7. **Test security**: Include security tests in your test suite
8. **Log security events**: Monitor for suspicious activity
9. **Use HTTPS in production**: Never send tokens over HTTP
10. **Regular security audits**: Review code for vulnerabilities
