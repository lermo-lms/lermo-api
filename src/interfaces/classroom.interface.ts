import { Document, Schema, ObjectId } from 'mongoose';

export interface IClassroom {
  name: string,
  description: string,
  type: string,
  banner: string,
  userId: ObjectId
}

export interface IClassroomModel extends Document, IClassroom {
  createAt: Date;
  updateAt: Date;
}

const ClassroomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    description: String,
    type: String,
    banner: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export { ClassroomSchema }