import { Model } from 'mongoose';
import { Story, StoryDocument } from './schemas/story.schema';
export declare class StoriesService {
    private storyModel;
    constructor(storyModel: Model<StoryDocument>);
    create(userId: string, file: Express.Multer.File): Promise<Story>;
    getFeed(): Promise<any[]>;
}
