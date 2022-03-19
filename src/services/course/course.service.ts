import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { ICourseModel, ICourse } from 'src/interfaces/course.interface';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel('course') private readonly courseModel: Model<ICourseModel>,
  ) {}

  async create(document: ICourse): Promise<ICourseModel> {
    const res = new this.courseModel(document);
    return await res.save().catch((err) => {
      console.error(err);
      return null
    });
  }

  async updatePostionVideo(_id: ObjectId, videoLists: [string]): Promise<any> {
    const res = await this.courseModel.updateOne(
      { _id }, 
      { $set: {
        videoLists,
      }}
    );
    return res
  }
}
