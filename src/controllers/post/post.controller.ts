import { Controller } from '@nestjs/common';
import {
  Post,
  Body,
  Get,
  Delete,
  Request,
  UseGuards,
  Query,
  Param,
  Patch,
  UseInterceptors,
  UploadedFile,
  Inject,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import {
  FileUploadDTO,
} from 'src/common/validators';

import { FileInterceptor } from '@nestjs/platform-express';

import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PostDTO, UpdatePostDTO, CreateCommentDTO } from 'src/common/validators';
import { ApiBody, ApiBearerAuth, ApiConsumes, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PostService } from 'src/services/post/post.service';
import { UserService } from 'src/services/user/user.service';
import { CommentService } from 'src/services/comment/comment.service';
import { NotificationService } from 'src/services/notification/notification.service'
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS, MESSAGE_TYPE } from 'src/interfaces/notification.interface'
import {
  IStorageService,
  UploadKey,
} from 'src/common/interfaces/storage.interface';
import { TYPES } from 'src/common/types';
import { PostEntity, PostImageEntity } from 'src/entity/post.entity'
import { CommentEntity } from 'src/entity/comment.entity'
import { IPostCreate, IPostUpdate } from 'src/interfaces/post.interface'

@Controller('posts')
@UseInterceptors(ResponseInterceptor)
@ApiTags('posts')
export class PostController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly notificationService: NotificationService,
    @Inject(TYPES.IStorageService)
    private readonly storageService: IStorageService
  ){}

  @Get('/suggested')
  @UseGuards(JwtAuthGuard)
  async suggestPost(@Request() req: any) {
    const { _id } = req.user

    const user = await this.userService.findById(_id)
    const query = user.explore.join(" ")

    const res = await this.postService.suggestPost(query)
    return res
  }

  @Get('/')
  // @UseGuards(JwtAuthGuard)
  async getPost(@Request() req) {
    const status = { status: 'publish' }


    const posts = await this.postService.find(status).catch(() => {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    const res = await Promise.all(
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

    return res
  }

  @Get('/:id')
  // @UseGuards(JwtAuthGuard)
  async getById(@Param() param) {
    const { id } = param

    const post = await this.postService.findById(id).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    const user = await this.userService.findById(`${post.userId}`)
    const data = {
      ...post.toJSON(),
      username: user.username,
      avatar: user.avatar,
    }

    return new PostEntity(data)
  }

  @Patch('/:id/view')
  @ApiParam({ name: 'id', type: String })
  async updateView(@Param() params): Promise<any> {
    const { id } = params;

    const resUpdate = await this.postService.updateView(id);
    if (!resUpdate) {
      throw new NotFoundException({ id }, `Failed to update`);
    }

    return {
      id,
      message: 'Update view success',
    };
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: PostDTO })
  async post(@Request() req, @Body() body: PostDTO) {
    // Refactor to model
    const { _id } = req.user
    const data: IPostCreate = {
      userId: _id,
      contentRAW: body.contentRAW,
      contentHTML: body.contentHTML,
      status: body.status,
      postType: 'post'
    }

    const res =  await this.postService.create(data).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    this.postService.indexPost(data).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return res
  }

  @Patch('/')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdatePostDTO })
  async updatePost(@Request() req, @Body() body: UpdatePostDTO) {
    // Refactor to model
    const userIDFromToken = req.user ? req.user._id : ""
    const { postId, contentRAW, status, tags, contentHTML } = body

    let data: any = {}

    if (status === 'deleted') {
      data = {
        status: status
      }
    } else {
      const raw: any = contentRAW
      const title = raw?.blocks[0].text || ''
      const thumbnail = raw?.entityMap[0]?.data.src
      let description = ''
      raw?.blocks.forEach((block, i) => {
        if (i > 0 && i <= 5) description += `${block.text} `
      })

      data = {
        title,
        description,
        thumbnail,
        contentRAW: contentRAW,
        contentHTML: contentHTML,
        status: status,
        tags: tags || []
      }
    }

    const post = await this.postService.findById(postId).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    if (userIDFromToken === post.userId) {
      await this.postService.updatePost(postId, data).catch((err) => {
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

    // this.postService.indexPost(data).catch(() => {
    //   throw new HttpException({
    //     status: HttpStatus.INTERNAL_SERVER_ERROR,
    //     message: 'Something went wrong',
    //   }, HttpStatus.INTERNAL_SERVER_ERROR);
    // });

    return {"status": status}
  }

  @Post("/index")
  async indexPost(){
    const posts = await this.postService.find({}).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    posts.forEach((post) => this.postService.indexPost(post))
   
    return {"status": "done"}
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteById(@Param() param,@Request() req) {
    const { id } = param
    const { _id } = req.user
    let res

    const post = await this.postService.findById(id).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });


    if (post && post.userId === _id) {
      res = await this.postService.findByIdAndRemove(id).catch((err) => {
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

    return res
  }

  @Patch('/:id/image')
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

    const fileName = `${id}/${new Date().getTime()}-${file.originalname}`
    const imageUrl = await this.uploadThumbnail(buffer, fileName);

    return new PostImageEntity({imageUrl}) 
  }

  private async uploadThumbnail(
    buffer: Buffer,
    fileName: string,
  ): Promise<string> {
    const path = `${this.storageService.getLocationPath(
      UploadKey.POST_IMAGE,
    )}/${fileName}`;

    const resUpload = await this.storageService.uploadFile(
      buffer,
      path,
      'public-read',
    );
    return resUpload.Key;
  }

@Get('/:postId/comments')
@ApiParam({ name: 'postId', type: String })
async fetchCommentAll(@Param() params): Promise<any> {
  const { postId } = params;

  const comments = await this.commentService.findAll(postId);
  if (!comments) {
    throw new NotFoundException({ postId }, 'Not found comments');
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
    id: postId,
    comments: res,
  };
}

@Post('/:postId/comments')
@ApiParam({ name: 'postId', type: String })
@ApiBody({ type: CreateCommentDTO })
@UseGuards(JwtAuthGuard)
async createComment(
  @Param() params,
  @Request() req: any,
  @Body() body: CreateCommentDTO,
): Promise<any> {
  const { postId } = params;
  const { user } = req;
  const { _id, username } = user;
  const { message } = body;

  const document = {
    userId: _id,
    postId,
    message,
  };
  const res = await this.commentService.create(document);
  if (!res) {
    throw new NotFoundException(document, `Something weng wrong`);
  }

  // comment User != Post User
  const post = await this.postService.findById(postId)
  if (_id !== post.userId) {
    const noti  = {
      userId: post.userId,
      contentId: postId,
      message: `${username} ${MESSAGE_TYPE.POST_COMMENT}`,
      notiType: NOTIFICATION_TYPE.POST_COMMENT,
      status: NOTIFICATION_STATUS.UNREAD,
    }
    await this.notificationService.create(noti)
  }


  return {
    id: postId,
    comments: document,
  };
}

}
