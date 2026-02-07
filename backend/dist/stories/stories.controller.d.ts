import { StoriesService } from './stories.service';
export declare class StoriesController {
    private storiesService;
    constructor(storiesService: StoriesService);
    getFeed(): Promise<any[]>;
    create(req: any, file: Express.Multer.File): Promise<import("./schemas/story.schema").Story>;
}
