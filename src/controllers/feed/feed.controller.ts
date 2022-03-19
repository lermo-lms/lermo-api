import {
  Controller,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
  Patch,
  Param,
  Inject,
  NotFoundException,
  Get,
  Request,
  Query,
  HttpException,
  HttpStatus,
  Headers,
  HttpService,
  Delete,
  ClassSerializerInterceptor,
  UsePipes
} from '@nestjs/common';
import {
  CreateVideoDTO,
  FileUploadDTO,
  CreateCommentDTO,
  UpdateVideoStatusDTO,
  UpdateVideoDTO
} from 'src/common/validators';
import { VideoService } from 'src/services/video/video.service';
import {
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { TYPES } from 'src/common/types';
import {
  IStorageService,
  UploadKey,
} from 'src/common/interfaces/storage.interface';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CommentService } from 'src/services/comment/comment.service';
import { UserService } from 'src/services/user/user.service';
import { PostService } from '../../services/post/post.service';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';

import { VideoEntity } from 'src/entity/video.entity'
import { PostEntity } from 'src/entity/post.entity'
import { CommentEntity  } from 'src/entity/comment.entity'
import { IVideoModel } from 'src/interfaces/video.interface'

@Controller('feeds')
@UseInterceptors(ResponseInterceptor)
@ApiTags('feeds')
export class FeedController {
  constructor(
    private readonly userService: UserService,
    private readonly videoService: VideoService,
    private readonly commentService: CommentService,
    @Inject(TYPES.IStorageService)
    private readonly storageService: IStorageService,
    private readonly httpService: HttpService,
    private readonly postService: PostService,
  ) {}

  @Get('/')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async feeds(@Request() req: any, @Query('page') page: string, @Query('limit') limit: string,  @Query('uid') uid) {
    /* Videos, Posts, Tranding, Topic
    Videos List, Article List */ 
    let postQuery
    let videoQuery
    if (uid) {
      postQuery = { userId: uid,  status: 'publish' }
      videoQuery = { userId: uid, $or: [ { status: 'completed' }, { status: 'streaming'} ]  }
    } else {
      postQuery = { status: 'publish' }
      videoQuery = { $or: [ { status: 'completed' }, { status: 'streaming'} ] }
    }

    const posts = await this.postService.findAll(postQuery, parseInt(page), parseInt(limit)).catch(() => {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    const postsData = await Promise.all(
      posts.map(async (post) => {
        const user = await this.userService.findById(`${post.userId}`)
        const data = {
          ...post.toJSON(),
          username: user.username,
          avatar: user.avatar,
        }

        return new PostEntity(data)
      })
    )

    const videos = await this.videoService.findAll(videoQuery, parseInt(page), parseInt(limit));
    const videosData = await Promise.all(
      videos.map(async (video) => {
        const user = await this.userService.findById(`${video.userId}`)
        const videoJSON = video.toJSON()
        const data = {
          ...videoJSON,
          username: user.username,
          avatar: user.avatar,
        }

        return new VideoEntity(data)
      }),
    );

    const data = [
      ...postsData,
      ...videosData
    ]

    const sortedData = data.sort((a: any, b: any) => {
      return  b.createdAt - a.createdAt 
    })

    return sortedData
  }

  @Get('/myfeed')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @UseGuards(JwtAuthGuard)
  async getMyFeed(@Request() req: any, @Query('page') page: string, @Query('limit') limit: string): Promise<any> {
    const { _id } = req.user
    const postQuery = { userId: _id, status: { $ne: 'deleted'}}
    const videoQuery = { userId: _id, status: { $ne: 'deleted'}}

    const posts = await this.postService.findAll(postQuery, parseInt(page), parseInt(limit)).catch(() => {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    const postsData = await Promise.all(
      posts.map(async (post) => {
        const user = await this.userService.findById(`${post.userId}`)
        const data = {
          ...post.toJSON(),
          username: user.username,
          avatar: user.avatar,
        }

        return new PostEntity(data)
      })
    )

    const videos = await this.videoService.findAll(videoQuery, parseInt(page), parseInt(limit));
    const videosData = await Promise.all(
      videos.map(async (video) => {
        const user = await this.userService.findById(`${video.userId}`)
        const videoJSON = video.toJSON()
        const data = {
          ...videoJSON,
          username: user.username,
          avatar: user.avatar,
        }

        return new VideoEntity(data)
      }),
    );

    const data = [
      ...postsData,
      ...videosData
    ]

    const sortedData = data.sort((a: any, b: any) => {
      return  b.createdAt - a.createdAt 
    })

    return sortedData
  }

}
