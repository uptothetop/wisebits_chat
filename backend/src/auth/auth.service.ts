import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    /**
   * Validates a user based on username and password.
   * @param username The username to validate.
   * @param pass The password to validate.
   * @returns The user object (minus password) if validation succeeds, or null.
   */
    async validateUser(username: string, pass: string): Promise<Record<string, unknown> | null> {
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(pass, user.password))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: User & { _id: string }) {
        const payload = { username: user.username, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async register(createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }
}
