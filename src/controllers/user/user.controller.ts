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
  Param,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  CreateUserDTO,
  FileUploadDTO,
  CreateFollowDTO,
  UpdateUserDTO,
} from 'src/common/validators';
import {
  IStorageService,
  UploadKey,
} from 'src/common/interfaces/storage.interface';
import { SendEmailRequest } from 'aws-sdk/clients/ses';

import { TYPES } from 'src/common/types';
// import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { UserEntity, UserProfileEntity } from 'src/entity/user.entity';

import { UserService } from 'src/services/user/user.service';
import { VideoService } from 'src/services/video/video.service';
import { PostService } from 'src/services/post/post.service';
import { FollowService } from 'src/services/follow/follow.service';
import { AuthService } from 'src/services/auth/auth.service';

import { NotificationService } from 'src/services/notification/notification.service';
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_STATUS,
  MESSAGE_TYPE,
} from 'src/interfaces/notification.interface';

import { ConfigService } from '@nestjs/config';

const S3_URL = process.env.S3_URL || '';

@Controller('users')
@UseInterceptors(ResponseInterceptor)
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly videoService: VideoService,
    private readonly followService: FollowService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    @Inject(TYPES.IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  @Get('/')
  async getUser() {
    const users = await this.userService.findAll({});
    const res: UserEntity[] = users.map(user => new UserEntity(user));
    return res;
  }

  @Get('/suggested')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserEntity,
    description: 'suggest users by eplore data',
  })
  async suggestUser(@Request() req: any): Promise<any> {
    const { _id } = req.user;
    const user = await this.userService.findById(_id).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
    const query = user.explore.join(' ');
    const posts = await this.postService.suggestPost(query).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
    const videos = await this.videoService.suggestVideo(query).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
    const data = posts.concat(videos);
    const userIds = data.filter(x => x.userId);

    const users = await this.userService.findByIds(userIds).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    const res: UserEntity[] = users.map(
      (user: UserEntity) => new UserEntity(user.toJSON()),
    );
    return res;
  }

  @Get('/profile/:id')
  @ApiParam({ name: 'id', required: true })
  async getProfileById(@Param('id') id: string): Promise<any> {
    const res = await this.userService.findById(id).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    if (!res) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return new UserEntity(res);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any): Promise<any> {
    const { user } = req;
    const { _id } = user;

    const res = await this.userService.findById(_id).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    return new UserProfileEntity(res);
  }

  @Get('/follow/:id')
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({ name: 'isFollowId', required: false })
  async getFollowing(
    @Param('id') id: string,
    @Query('isFollowId') isFollowId,
    @Request() req: any,
  ) {
    const queryFollower = { followId: id };
    const queryFollowing = { userId: id };

    const follower = await this.followService.count(queryFollower);
    const following = await this.followService.count(queryFollowing);
    const user = await this.followService.findByfollowId(isFollowId, id);
    const isFollow = user ? true : false;

    return { follower: follower, following: following, isFollow: isFollow };
  }

  @Patch('/profile')
  @ApiBody({ type: UpdateUserDTO })
  @UseGuards(JwtAuthGuard)
  async upadteProfile(
    @Request() req: any,
    @Body() body: UpdateUserDTO,
  ): Promise<any> {
    const { user } = req;
    const { _id, email } = user;
    const data: any = {};

    if (body.username) data.username = body.username;
    if (body.about) data.about = body.about;
    if (body.age) data.age = body.age;
    if (body.gender) data.gender = body.gender;

    if (body.oldPassword && body.password) {
      const user = await this.authService.validateUser(email, body.oldPassword);
      if (user) {
        data.password = await this.authService
          .hashPassword(body.password)
          .catch(err => {
            console.error(err);
            throw new HttpException(
              {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Something went wrong',
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          });
      } else {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: 'User password is not correct',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    await this.userService.update(_id, data).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    const res = await this.userService.findById(_id).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    return new UserProfileEntity(res);
  }

  @Post('/register')
  @ApiBody({ type: CreateUserDTO })
  async register(@Body() body: CreateUserDTO): Promise<any> {
    const user = await this.userService.create(body).catch(() => {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'Email does exists',
        },
        HttpStatus.CONFLICT,
      );
    });
    const { email, username } = user;
    return {
      email,
      username,
    };
  }

  @Post('/index')
  async index() {
    const users = await this.userService.findAll({}).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    users.forEach(user => this.userService.indexUser(user));

    return { status: 'done' };
  }

  @Post('/forgot')
  async forgotPassword(@Body() body: any) {
    const { email } = body;
    const user = await this.userService.findOne(email);

    if (!user) {
      return { status: 'done' };
    }

    const auth = await this.authService.ssoLogin(email);

    const { access_token } = auth;
    const domain = this.configService.get('WEB_URL');
    const bodyMsg = `Reset your password ${domain}/forgot?token=${access_token}`;

    const params: SendEmailRequest = {
      Source: 'no-reply@lermo.io',
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Forgot Password',
        },
        Body: {
          Text: {
            Data: bodyMsg,
          },
        },
      },
    };

    this.storageService.sendEmail(params);

    return { status: 'done' };
  }

  @Patch('/resetpassword')
  @ApiBody({ type: UpdateUserDTO })
  @UseGuards(JwtAuthGuard)
  async upadtePassword(
    @Request() req: any,
    @Body() body: UpdateUserDTO,
  ): Promise<any> {
    const { user } = req;
    const { _id } = user;
    const data: any = {};

    if (body.password) {
      data.password = await this.authService
        .hashPassword(body.password)
        .catch(err => {
          console.error(err);
          throw new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: 'Something went wrong',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        });
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Password is require',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.userService.update(_id, data).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    const res = await this.userService.findById(_id).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    return new UserProfileEntity(res);
  }

  @Post('follow')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateFollowDTO })
  async follow(@Request() req: any, @Body() body: CreateFollowDTO) {
    const { username } = req.user;
    const userId: string = req.user._id;
    const followId = body.followId;

    if (followId === 'myspace' || userId === followId) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: "Can't follow",
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const follow = await this.followService
      .findByfollowId(userId, followId)
      .catch(err => {
        console.error(err);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Something went wrong',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    if (follow) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Following',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const data = {
      userId: userId,
      followId: followId,
    };

    await this.followService.create(data).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    const noti = {
      userId: followId,
      message: `${username} ${MESSAGE_TYPE.FOLLOW}`,
      notiType: NOTIFICATION_TYPE.FOLLOW,
      status: NOTIFICATION_STATUS.UNREAD,
    };
    await this.notificationService.create(noti);

    const queryFollower = { followId: followId };
    const queryFollowing = { userId: followId };

    const follower = await this.followService.count(queryFollower);
    const following = await this.followService.count(queryFollowing);
    const user = await this.followService.findByfollowId(userId, followId);
    const isFollow = user ? true : false;

    return { follower: follower, following: following, isFollow: isFollow };
  }

  @Patch('/profile/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload profile avatar.',
    type: FileUploadDTO,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileAvatar(
    @Request() req: any,
    @UploadedFile() file,
  ): Promise<any> {
    const { buffer } = file;
    const { user } = req;
    const { _id } = user;

    const fileName = `${_id}.png`;
    const avatarURI = await this.uploadAvatarImg(buffer, fileName);
    const resUpdate = await this.userService.updateAvatar(_id, avatarURI);
    if (!resUpdate) {
      throw new NotFoundException(`Failed to update, user ID ${_id}`);
    }

    return {
      url: `${S3_URL}/${avatarURI}`,
    };
  }

  @Patch('/profile/banner')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload profile banner.',
    type: FileUploadDTO,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileBanner(
    @Request() req: any,
    @UploadedFile() file,
  ): Promise<any> {
    const { buffer } = file;
    const { user } = req;
    const { _id } = user;

    const fileName = `${_id}.png`;
    const bannerURI = await this.uploadBannerImg(buffer, fileName);
    const resUpdate = await this.userService.updateBanner(_id, bannerURI);
    if (!resUpdate) {
      throw new NotFoundException(`Failed to update, user ID ${_id}`);
    }

    return {
      url: `${S3_URL}/${bannerURI}`,
    };
  }

  @Post('unfollow')
  @UseGuards(JwtAuthGuard)
  async unfollow(@Request() req: any, @Body() body: CreateFollowDTO) {
    const userId: string = req.user._id;
    const followId = body.followId;

    const follow = await this.followService
      .findByfollowId(userId, followId)
      .catch(err => {
        console.error(err);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Something went wrong',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    if (!follow) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.followService.findByIdAndRemove(follow._id).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    const queryFollower = { followId: followId };
    const queryFollowing = { userId: followId };

    const follower = await this.followService.count(queryFollower);
    const following = await this.followService.count(queryFollowing);
    const user = await this.followService.findByfollowId(userId, followId);
    const isFollow = user ? true : false;

    return { follower: follower, following: following, isFollow: isFollow };
  }

  private async uploadAvatarImg(
    buffer: Buffer,
    fileName: string,
  ): Promise<string> {
    const path = `${this.storageService.getLocationPath(
      UploadKey.AVARTAR,
    )}/${fileName}`;

    const resUpload = await this.storageService.uploadFile(
      buffer,
      path,
      'public-read',
    );
    return resUpload.Key;
  }

  private async uploadBannerImg(
    buffer: Buffer,
    fileName: string,
  ): Promise<string> {
    const path = `${this.storageService.getLocationPath(
      UploadKey.BANNER,
    )}/${fileName}`;

    const resUpload = await this.storageService.uploadFile(
      buffer,
      path,
      'public-read',
    );
    return resUpload.Key;
  }
}
