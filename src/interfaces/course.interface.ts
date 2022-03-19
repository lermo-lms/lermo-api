import { Document, Schema } from 'mongoose';

export interface ICourse {
  title: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  videoLists?: Array<string>;
  // hashtags: string;
}

export interface ICourseModel extends Document, ICourse {
  createAt: Date;
  updateAt: Date;
}

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    price: Number,
    thumbnail: String,
    videoLists: Array,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export { CourseSchema };
