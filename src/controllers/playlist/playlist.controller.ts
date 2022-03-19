
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


import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';

import {
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateVideoPlaylistDTO } from 'src/common/validators'

import { PlaylistService } from 'src/services/playlist/playlist.service'
import { VideoService } from 'src/services/video/video.service'

import { ValidationPipe } from '@nestjs/common';


@Controller('playlist')
@ApiTags('playlist')
@UseInterceptors(ResponseInterceptor)
@ApiBearerAuth()
export class PlaylistController {

  constructor(
    private readonly playlistService: PlaylistService,
    private readonly videoService: VideoService
  ){}

  @Post('/')
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: CreateVideoPlaylistDTO })
  @UseGuards(JwtAuthGuard)
  async createPlaylist(@Body() body: CreateVideoPlaylistDTO, @Request() req: any) {
    const { _id } = req.user
    const { videos } = body;

    await Promise.all(
      videos.map(async (videoId) => {
        const video = await this.videoService.findById(videoId)
        if (video.userId != _id) {
          throw new HttpException({
            status: HttpStatus.UNAUTHORIZED,
            message: 'Video permission is denied',
          }, HttpStatus.UNAUTHORIZED);
        }
      }),
    );

    const date = {
      ...body,
      userId: _id
    }

    const res = await this.playlistService.create(date).catch((err) => {
      console.error(err)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return res
  }

  // Update

  // Delete

  

}
