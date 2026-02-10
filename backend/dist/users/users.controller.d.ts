import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: string): Promise<import("./schemas/user.schema").UserDocument[]>;
}
