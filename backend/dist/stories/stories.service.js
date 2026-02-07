"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const story_schema_1 = require("./schemas/story.schema");
let StoriesService = class StoriesService {
    constructor(storyModel) {
        this.storyModel = storyModel;
    }
    async create(userId, file) {
        const type = file.mimetype.startsWith('video') ? 'video' : 'image';
        const mediaUrl = `/uploads/${file.filename}`;
        const newStory = new this.storyModel({
            user: new mongoose_2.Types.ObjectId(userId),
            mediaUrl,
            type,
        });
        return newStory.save();
    }
    async getFeed() {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const stories = await this.storyModel.find({
            createdAt: { $gte: yesterday },
        }).populate('user', 'username').sort({ createdAt: 1 }).exec();
        const grouped = stories.reduce((acc, story) => {
            const userId = story.user._id.toString();
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
};
exports.StoriesService = StoriesService;
exports.StoriesService = StoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(story_schema_1.Story.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], StoriesService);
//# sourceMappingURL=stories.service.js.map