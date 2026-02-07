import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/schemas/user.schema';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(username: string, pass: string): Promise<Record<string, unknown> | null>;
    login(user: User & {
        _id: string;
    }): Promise<{
        access_token: string;
        user: User & {
            _id: string;
        };
    }>;
    register(createUserDto: CreateUserDto): Promise<User>;
}
