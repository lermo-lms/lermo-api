import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { IVideoPlaylistModel, IVideoPlaylist } from 'src/interfaces/playlist.interface'

@Injectable()
export class PlaylistService {

  constructor(
    @InjectModel('playlist') private IVideoPlaylistModel: Model<IVideoPlaylistModel>
  ){}

  async create(document: IVideoPlaylist): Promise<IVideoPlaylist> {
    const res = new this.IVideoPlaylistModel(document);
    return await res.save();
  }
  
}
