import { Controller, Get, Post, Request, UseGuards, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('stories')
export class StoriesController {
    constructor(private storiesService: StoriesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getFeed() {
        return this.storiesService.getFeed();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = file.originalname.split('.').pop();
                cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm)$/)) {
                return cb(new HttpException('Unsupported file type', HttpStatus.BAD_REQUEST), false);
            }
            cb(null, true);
        },
    }))
    async create(@Request() req, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new HttpException('File required', HttpStatus.BAD_REQUEST);
        return this.storiesService.create(req.user.userId, file);
    }
}
