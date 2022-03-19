import {
  Controller,
  Inject,
  Post,
  UseGuards,
  Body,
  ConflictException,
  Patch,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CourseService } from 'src/services/course/course.service';
import { TYPES } from 'src/common/types';
import { IStorageService } from 'src/common/interfaces/storage.interface';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateCourseDTO, UpdatePositionVideoDTO } from 'src/common/validators';

@Controller('courses')
@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    @Inject(TYPES.IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  @Post('/')
  @ApiBody({ type: CreateCourseDTO })
  async createVideo(@Body() body: CreateCourseDTO): Promise<any> {
    const { title, description, price, videoLists } = body;

    const res = await this.courseService.create(body);
    if (!res) throw new ConflictException(null, 'Something wrong');

    return {
      title,
      description,
      price,
      videoLists,
    };
  }

  @Patch('/:id/position-video')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePositionVideoDTO })
  async updatePositionVideo(
    @Param() params,
    @Body() body: UpdatePositionVideoDTO,
  ): Promise<any> {
    const { id } = params;
    const { videoLists } = body;

    const resUpdate = await this.courseService.updatePostionVideo(
      id,
      videoLists,
    );
    if (!resUpdate) {
      throw new NotFoundException({ id }, 'Failed to update');
    }

    return {
      id,
      videoLists,
    };
  }
}
