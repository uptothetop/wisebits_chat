import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
        user: import("../users/schemas/user.schema").User & {
            _id: string;
        };
    }>;
    register(createUserDto: CreateUserDto): Promise<import("../users/schemas/user.schema").User>;
    getProfile(req: any): any;
}
