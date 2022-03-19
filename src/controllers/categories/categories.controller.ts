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
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';

@Controller('categories')
@ApiTags('categories')
@UseInterceptors(ResponseInterceptor)
@ApiBearerAuth()
export class CategoriesController {
  @Get('/')
  async getCategories() {
    // Refactor to database
    return { "categories": ["IT", "Language", "Teaching & Academics", "Personal Development", "Business", "Sales & Marketing", "Engineering & Construction", "Management",]}
  }
}
