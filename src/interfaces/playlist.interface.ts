import { Document, Schema } from 'mongoose';

export interface IVideoPlaylist {
  title: string;
  userId: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  hashtag?: string;
  categories?: string;
  status: string
  videos: [string];
}

export interface IVideoPlaylistModel extends Document, IVideoPlaylist {
  createAt: Date;
  updateAt: Date;
}

const VideoPlaylistSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    description: String,
    price: Number,
    thumbnail: String,
    hashtag: String,
    categories: String,
    status: String,
    videos: [String]
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export { VideoPlaylistSchema };
