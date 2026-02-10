import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findOne(username: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    findAll(query?: string): Promise<UserDocument[]>;
}
