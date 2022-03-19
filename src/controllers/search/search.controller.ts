import { 
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFile,
  Inject,
  NotFoundException,
  HttpException,
  HttpStatus,
  Query,
  SerializeOptions,
  ClassSerializerInterceptor,
  Delete,

} from '@nestjs/common';

import { ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';

import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { UserService } from 'src/services/user/user.service';
import { VideoService } from 'src/services/video/video.service';
import { PostService } from 'src/services/post/post.service';
import { SearchDTO } from 'src/common/validators'

@Controller('search')
@UseInterceptors(ResponseInterceptor)
@ApiTags('search')
export class SearchController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly videoService: VideoService,
  ) {}

  @Get('/')
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'type', required: false })
  async searchVideo(@Request() req: any, 
    @Query('q') q: string, 
    @Query('from') from: number,
    @Query('size') size: number,
    @Query('type') type: string,
  ) {
    let posts: []
    let videos: []
    let users: []
    let res: {}

    if (type == 'all') {
      try {
        // posts = await this.postService.search(q || '', from || 0, size || 20)
        videos = await this.videoService.search(q || '', from || 0, size || 20)
        users = await this.userService.search(q || '', from || 0, size || 20)
        
        res = { posts: posts, videos: videos, users: users }
      } catch (err) {
        console.error(err)
        throw new HttpException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    if (type == 'video') {
      try {
        videos = await this.videoService.search(q || '', from || 0, size || 20)
        res = videos
      } catch (err) {
        console.error(err)
        throw new HttpException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    // if (type == 'post') {
    //   try {
    //     posts = await this.postService.search(q, from || 0, size || 20)
    //     res = posts
    //   } catch (err) {
    //     console.error(err)
    //     throw new HttpException({
    //       status: HttpStatus.INTERNAL_SERVER_ERROR,
    //       message: 'Something went wrong',
    //     }, HttpStatus.INTERNAL_SERVER_ERROR);
    //   }
    // }

    if (type == 'user') {
      try {
        users = await this.userService.search(q || '', from || 0, size || 20)
        res = users
      } catch (err) {
        console.error(err)
        throw new HttpException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    return res
  }
}
