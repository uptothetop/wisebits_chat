import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Story, StoryDocument } from './schemas/story.schema';

@Injectable()
export class StoriesService {
    constructor(@InjectModel(Story.name) private storyModel: Model<StoryDocument>) { }

    async create(userId: string, file: Express.Multer.File): Promise<Story> {
        const type = file.mimetype.startsWith('video') ? 'video' : 'image';
        const mediaUrl = `/uploads/${file.filename}`;
        const newStory = new this.storyModel({
            user: new Types.ObjectId(userId),
            mediaUrl,
            type,
        });
        return newStory.save();
    }

    async getFeed(): Promise<any[]> {
        // 1. Get stories from last 24h (handled by TTL but query helps too)
        // 2. Group by user
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const stories = await this.storyModel.find({
            createdAt: { $gte: yesterday },
        }).populate('user', 'username').sort({ createdAt: 1 }).exec();

        // Grouping by user
        const grouped = stories.reduce((acc, story) => {
            const userId = (story.user as any)._id.toString();
            if (!acc[userId]) {
                acc[userId] = {
                    user: story.user,
                    items: [],
                };
            }
            acc[userId].items.push(story);
            return acc;
        }, {});

        return Object.values(grouped);
    }
}
