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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorySchema = exports.Story = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../users/schemas/user.schema");
let Story = class Story {
};
exports.Story = Story;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: user_schema_1.User.name, required: true }),
    __metadata("design:type", user_schema_1.User)
], Story.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Story.prototype, "mediaUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['image', 'video'] }),
    __metadata("design:type", String)
], Story.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, expires: '24h', default: Date.now }),
    __metadata("design:type", Date)
], Story.prototype, "createdAt", void 0);
exports.Story = Story = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Story);
exports.StorySchema = mongoose_1.SchemaFactory.createForClass(Story);
//# sourceMappingURL=story.schema.js.map