import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import {
  IClassroom,
  IClassroomModel,
} from 'src/interfaces/classroom.interface';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectModel('classroom')
    private readonly classroomModel: Model<IClassroomModel>,
  ) {}

  async create(document: IClassroom): Promise<IClassroomModel> {
    const res = new this.classroomModel(document);
    return await res.save();
  }

  async findAll(
    query: unknown,
    page?: number,
    limit?: number,
  ): Promise<IClassroomModel[]> {
    const res = await this.classroomModel
      .find(query)
      .skip(page * limit)
      .limit(limit || 20)
      .sort({ createdAt: -1 });
    return res;
  }

  async findOneById(id): Promise<IClassroomModel> {
    return this.classroomModel.findOne({ _id: id });
  }
}
