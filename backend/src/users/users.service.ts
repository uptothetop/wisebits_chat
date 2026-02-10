import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { username, email, password } = createUserDto;
        const items = await this.userModel.find({ $or: [{ username }, { email }] }).exec();
        if (items.length > 0) {
            throw new Error('User with this email or username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        return createdUser.save();
    }

    async findOne(username: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ username }).exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async findAll(query?: string): Promise<UserDocument[]> {
        const filter = query
            ? { username: { $regex: query, $options: 'i' } }
            : {};
        return this.userModel.find(filter).select('-password').exec();
    }
}
