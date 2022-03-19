import { Document, Schema, ObjectId } from 'mongoose';

export interface IPost extends Document  {
  userId: string,
  contentRAW: JSON,
  contentHTML: string,
  status: string,
  tags?: [];
}

export interface IPostCreate {
  userId: string,
  contentRAW: JSON,
  contentHTML: string,
  status: string,
  postType: string,
  tags?: [];
}

export interface IPostUpdate {
  title: string,
  description: string,
  thumbnail: string,
  contentRAW: JSON,
  contentHTML: string,
  status: string,
  tags?: [];
}

export interface PostSearchBody {
  userId: string,
  date: Date,
  content: JSON
}

export interface PostSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: PostSearchBody;
    }>;
  };
}

const PostSchema = new Schema (
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    contentRAW: {
      type: JSON,
      required: true,
    },
    contentHTML: {
      type: String,
    },
    view: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
    },
    postType: {
      type: String,
    },
    tags: Array
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false
  },
)

export { PostSchema };
