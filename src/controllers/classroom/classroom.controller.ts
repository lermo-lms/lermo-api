import {
  Controller,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  Inject,
  Get,
  Request,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateClassroomDTO, FileUploadDTO, JoinClassroom } from 'src/common/validators'
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ClassroomService } from 'src/services/classroom/classroom.service';
import { IClassroom } from 'src/interfaces/classroom.interface';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { TYPES } from 'src/common/types';
import {
  IStorageService,
  UploadKey,
} from 'src/common/interfaces/storage.interface';
import { UserService } from 'src/services/user/user.service';

const S3_URL = process.env.S3_URL || '';

@Controller('classrooms')
@ApiTags('classrooms')
@UseInterceptors(ResponseInterceptor)
export class ClassroomController {
  constructor(
    private readonly classroomService: ClassroomService,
    private readonly userService: UserService,
    @Inject(TYPES.IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  @Get('/')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getClassroom(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<any> {
    const classrooms: IClassroom[] = await this.classroomService.findAll(
      {},
      parseInt(page),
      parseInt(limit),
    );
    return classrooms;
  }

  @Post('/')
  @ApiBody({ type: CreateClassroomDTO })
  @UseGuards(JwtAuthGuard)
  async createClassroom(
    @Body() body: CreateClassroomDTO,
    @Request() req: any,
  ): Promise<any> {
    const { _id } = req.user;
    const { name, description, type } = body;

    const classroom: IClassroom = {
      userId: _id,
      name,
      description,
      type,
      banner: body.banner,
    };

    const res = await this.classroomService.create(classroom).catch(err => {
      console.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    return res;
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getOneClassroom(@Param() params): Promise<any> {
    const { id } = params;

    const res = await this.classroomService.findOneById(id);

    return res;
  }

  @Post('/join')
  @ApiBody({ type: JoinClassroom })
  @UseGuards(JwtAuthGuard)
  async joinClassroom(@Body() body: JoinClassroom, @Request() req: any): Promise<any> {
    const userId: string = req.user._id;
    const { classroomId } = body

    const user = await this.userService.findById(userId)

    const classroom = await this.classroomService.findOneById(classroomId)
    
    const isUserJoined = await user.classrooms.find(element =>  element === classroomId) || false

    if(isUserJoined) {
      return { mesage : "user already joined" }
    }

    const data = user
    data.classrooms.push(classroomId)
    await this.userService
      .update(userId, data)
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

      return { "Message": "Updated" }
  }

  @Post('/upload/cover')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    description: 'Upload classroom cover.',
    type: FileUploadDTO,
  })
  @UseInterceptors(FileInterceptor('file'))
  async updateClassroomCover(@UploadedFile() file): Promise<any> {
    const { buffer, originalname } = file;
    const coverURI = await this.uploadCover(buffer, originalname);
    return { url: `${S3_URL}/${coverURI}` };
  }

  private async uploadCover(buffer: Buffer, fileName: string): Promise<string> {
    const path = `${this.storageService.getLocationPath(
      UploadKey.CLASSROOM_COVER,
    )}/${fileName}`;

    const resUpload = await this.storageService.uploadFile(
      buffer,
      path,
      'public-read',
    );
    return resUpload.Key;
  }
}
