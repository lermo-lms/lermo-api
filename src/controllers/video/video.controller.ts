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
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';

import { VideoEntity, VideoKeyEntity } from 'src/entity/video.entity'
import { CommentEntity  } from 'src/entity/comment.entity'
import { IVideoModel } from 'src/interfaces/video.interface'
import crypto from 'crypto'

import { NotificationService } from 'src/services/notification/notification.service'
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS, MESSAGE_TYPE } from 'src/interfaces/notification.interface'

@Controller('videos')
@ApiTags('videos')
@UseInterceptors(ResponseInterceptor)
@ApiBearerAuth()
export class VideoController {
  constructor(
    private readonly userService: UserService,
    private readonly videoService: VideoService,
    private readonly commentService: CommentService,
    @Inject(TYPES.IStorageService)
    private readonly storageService: IStorageService,
    private readonly httpService: HttpService,
    private readonly notificationService: NotificationService
  ) {}

  @Get('/suggested')
  async suggestVideo(@Request() req: any) {
    const { _id } = req.user
    const user = await this.userService.findById(_id)
    const query = user.explore.join(" ")

    const res = await this.videoService.suggestVideo(query)
    return res
  }

  @Get('/')
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'user', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAll(@Query('title') title: string, @Query('user') user: string, @Query('page') page: string, @Query('limit') limit: string): Promise<any> {
    let videos:IVideoModel[]

    if (title) {
      videos = await this.videoService.findByTitle(title);
    } else if (user) {
      videos = await this.videoService.findByUserId(user);
      videos = videos.filter(video => (video.status !== "deleted"))
    } else {
      videos = await this.videoService.findAll({ status: "completed" }, parseInt(page), parseInt(limit));
    }

    const res = await Promise.all(
      videos.map(async (video) => {
        const user = await this.userService.findById(`${video.userId}`)
        const videoJSON = video.toJSON()
        const data = {
          ...videoJSON,
          username: user.username,
          avatar: user.avatar,
          about: user.about
        }

        return new VideoEntity(data)
      }),
    );

    return res
  }

  @Get('/:id')
  @ApiParam({ name: 'id', type: String })
  async getVideoById(@Param() params): Promise<any> {
    const { id } = params;
    const video = await this.videoService.findById(id);

    const user = await this.userService.findById(`${video.userId}`)
    const videoJSON = video.toJSON()
    const data = {
      ...videoJSON,
      username: user.username,
      avatar: user.avatar,
      about: user.about,
      videoUrl: videoJSON.videoPath
    }

    return new VideoEntity(data)
  }

  @Post('/')
  @ApiBody({ type: CreateVideoDTO })
  @UseGuards(JwtAuthGuard)
  async createVideo(@Body() body: CreateVideoDTO, @Request() req: any): Promise<any> {
    const { _id } = req.user
    const data: CreateVideoDTO = {
      userId: _id,
      ...body
    }

    if (data.videoType === 'live') {
      data.videoKey = `Lermo-${crypto.randomBytes(10).toString('hex')}`
    }

    const res =  await this.videoService.create(data).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    this.videoService.indexVideo(res).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return res
  }

  @Post('/stream/verify')
  async verifyStreamKey(@Body() body) {
    const { videoKey } = body
    const video = await this.videoService.findByStreamKey(videoKey)
    const res = video ? video.toJSON() : {}
    return new VideoKeyEntity(res)
  }

  @Post('/stream/end')
  async endLiveStream(@Body() body) {
    const { videoKey } = body

    if (!videoKey) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Video key is empty.',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const video = await this.videoService.findByStreamKey(videoKey)

    if (!video) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const data = {
      status: 'completed',
      videoType: 'video'
    }

    await this.videoService.updateVideo(video._id, data).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    await this.videoService.deleteVideoKey(videoKey).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return {
      status: "update completed"
    }
  }

  @Patch('/')
  @ApiBody({ type: UpdateVideoDTO })
  // @UsePipes(new ValidationPipe())
  // @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  async updateVideo(@Body() body: UpdateVideoDTO, @Request() req: any) {
    const userIDFromToken = req.user ? req.user._id : ""
    const { videoId, status, videoType } = body;
    let data = {}

    // Refactor to transform factory
    if (status === 'deleted') {
      data = {
        status: status
      }
    } else if (videoType === 'live') {
      data = {
        title: body.title,
        description: body.description,
        paymentType: body.paymentType,
        videoType: body.videoType,
        enableDonation: body.enableDonation,
        price: body.price,
        freeMinute: body.freeMinute,
        tags: body.tags,
        categories: body.categories,
        status: 'streaming',
        videoName: videoId,
        videoPath: videoId
      }
    } else {
      data = {
        title: body.title,
        description: body.description,
        paymentType: body.paymentType,
        videoType: body.videoType,
        enableDonation: body.enableDonation,
        price: body.price,
        freeMinute: body.freeMinute,
        tags: body.tags,
        status: body.status,
        categories: body.categories
      }
    }

    const video = await this.videoService.findById(videoId).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    if (userIDFromToken === video.userId) {
      await this.videoService.updateVideo(videoId, data).catch((err) => {
        console.error(err)
        throw new HttpException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      });
    } else {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Your permission is denied',
      }, HttpStatus.UNAUTHORIZED);
    }

    const res = await this.videoService.findById(videoId).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return res
  }

  @Patch('/status')
  @ApiBody({ type: UpdateVideoStatusDTO })
  @UseGuards(JwtAuthGuard)
  async updateVideoStatus(@Body() body: UpdateVideoStatusDTO, @Request() req: any): Promise<any> {
    const userIDFromToken = req.user ? req.user._id : ""
    const { videoId ,status, videoName, videoPath } = body;

    const video = await this.videoService.findById(videoId).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    if (video && userIDFromToken === video.userId) {
      await this.videoService.updateVideoStatus(videoId, body).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    } else {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Your permission is denied',
      }, HttpStatus.UNAUTHORIZED);
    }

    return {
      status: "update completed"
    }
  }

  @Post('/search')
  @ApiBearerAuth()
  async search(@Request() req: any) {}

  @Post("/index")
  async index(){
    const videos = await this.videoService.findAll({}).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    videos.forEach((video) => this.videoService.indexVideo(video))

    return {"status": "done"}
  }

  // Migrate to transcode api
  // @Patch('/:id/source')
  // @ApiConsumes('multipart/form-data')
  // @ApiParam({ name: 'id', type: String })
  // @ApiBody({
  //   description: 'Upload video source.',
  //   type: FileUploadDTO,
  // })
  // @UseInterceptors(FileInterceptor('file'))
  // async updateVideoSource(
  //   @Param() params, 
  //   @UploadedFile() file, 
  //   @Request() req,
  //   @Headers() auth
  // ): Promise<any> {
  //   const { id } = params;
  //   // const { buffer } = file;
  //   const { _id } = req.user
  //   const { authorization } = auth

  //   console.log(auth)
  //   const video = await this.videoService.findOne(id);
  //   if (!video) {
  //     const msgNotFound = 'Not found video.';
  //     throw new NotFoundException({ id }, msgNotFound);
  //   }
  //   const data = {
  //     // file: file,
  //     userId: _id,
  //     videoId: id,
  //     authorization: authorization
  //   }

  //   this.httpService.post("http://localhost:8080/upload", data).toPromise()
  //   .then((response) => {
  //     console.log(response);
  //   }, (error) => {
  //     console.log(error);
  //   });
    
  //   throw 'Implment soon';
  // }

  @Patch('/:id/thumbnail')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    description: 'Upload video thumbnail.',
    type: FileUploadDTO,
  })
  @UseInterceptors(FileInterceptor('file'))
  async updateVideoThumbnail(
    @Param() params,
    @UploadedFile() file,
  ): Promise<any> {
    const { id } = params;
    const { buffer } = file;

    const video = await this.videoService.findOne(id);
    if (!video) {
      const msgNotFound = 'Not found video.';
      throw new NotFoundException({ id }, msgNotFound);
    }

    const fileName = `${id}.png`;
    const thumbnailURI = await this.uploadThumbnail(buffer, fileName);
    const resUpdate = await this.videoService.updateThumbnail(id, thumbnailURI);
    if (!resUpdate) {
      throw new NotFoundException({ id }, `Failed to update`);
    }

    return {
      id,
      URI: thumbnailURI,
    };
  }

  @Patch('/:id/view')
  @ApiParam({ name: 'id', type: String })
  async updateView(@Param() params): Promise<any> {
    const { id } = params;

    const resUpdate = await this.videoService.updateView(id);
    if (!resUpdate) {
      throw new NotFoundException({ id }, `Failed to update`);
    }

    return {
      id,
      message: 'Update view success',
    };
  }

  @Get('/:videoId/comments')
  @ApiParam({ name: 'videoId', type: String })
  async fetchCommentAll(@Param() params): Promise<any> {
    const { videoId } = params;

    const comments = await this.commentService.findAll(videoId);
    if (!comments) {
      throw new NotFoundException({ videoId }, 'Not found comments');
    }

    const res = await Promise.all(
      comments.map(async (comment) => {
        const user = await this.userService.findById(`${comment.userId}`)

        const data = {
          username: user.username,
          avatar: user.avatar,
          message: comment.message,
          createdAt: comment.createdAt
        }

        return new CommentEntity(data)
      }),
    );

    return {
      id: videoId,
      comments: res,
    };
  }

  @Post('/:videoId/comments')
  @ApiParam({ name: 'videoId', type: String })
  @ApiBody({ type: CreateCommentDTO })
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param() params,
    @Request() req: any,
    @Body() body: CreateCommentDTO,
  ): Promise<any> {
    const { videoId } = params;
    const { user } = req;
    const { _id, username } = user;
    const { message } = body;

    const document = {
      userId: _id,
      videoId,
      message,
    };
    const res = await this.commentService.create(document);
    if (!res) {
      throw new NotFoundException(document, `Something weng wrong`);
    }

    const video = await this.videoService.findById(videoId)
    if (_id !== video.userId) {
      const noti  = {
        userId: video.userId,
        contentId: videoId,
        message: `${username} ${MESSAGE_TYPE.VIDEO_COMMENT}`,
        notiType: NOTIFICATION_TYPE.VIDEO_COMMENT,
        status: NOTIFICATION_STATUS.UNREAD,
      }
      await this.notificationService.create(noti)
    }

    return {
      id: videoId,
      comments: document,
    };
  }

  private async uploadThumbnail(
    buffer: Buffer,
    fileName: string,
  ): Promise<string> {
    const path = `${this.storageService.getLocationPath(
      UploadKey.VIDEO_THUMBNAIL,
    )}/${fileName}`;

    const resUpload = await this.storageService.uploadFile(
      buffer,
      path,
      'public-read',
    );
    return resUpload.Key;
  }
}
