import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model, ObjectId } from 'mongoose';
import { IPost, IPostCreate, IPostUpdate, PostSearchResult, PostSearchBody } from '../../interfaces/post.interface';
import { ElasticsearchService } from '@nestjs/elasticsearch';


@Injectable()
export class PostService {
  index = 'post'

  constructor(
    @InjectModel('post') private readonly postModel: Model<IPost>,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  async create(document: IPostCreate): Promise<IPost> {
    const res = new this.postModel(document);

    return await res.save();
  }

  async updatePost(_id: string, document: IPostUpdate): Promise<any> {
    const res = await this.postModel.findByIdAndUpdate(_id, document)
    return res
  }

  async find(query): Promise<any> {
    const res = await this.postModel.find(query).sort({ createdAt: -1 });
    return res;
  }

  async findAll(query: unknown, page?: number, limit?: number): Promise<any> {
    const res = await this.postModel
                        .find(query)
                        .skip(page * limit)
                        .limit(limit || 20)
                        .sort({ createdAt: -1 });

    return res;
  }

  async findById(_id: string): Promise<any> {
    const res = await this.postModel.findById(_id)
    return res;
  }

  async findByIdAndRemove(_id: string): Promise<any> {
    const res = await this.postModel.findByIdAndRemove(_id)

    return res;
  }

  async indexPost(post):Promise<any> {
    return await this.elasticsearchService.index<PostSearchResult, PostSearchBody>({
      index: this.index,
      body: {
        userId: post.id,
        date: post.date,
        content: post.content
      }
    })
  }

  async search(query: string, from: number, size: number):Promise<any> {
    const { body } = await this.elasticsearchService.search<PostSearchResult>({
      index: this.index,
      body: {
        from: from,
        size: size,
        query: {
          multi_match: {
            query: query,
            fields: ['content', 'content.h1', 'content.p']
          }
        }
      }
    })
    const hits = body.hits.hits;
    
    return hits.map((item) => item._source);
  }



  async suggestPost(query: string):Promise<any> {
    const { body } = await this.elasticsearchService.search<PostSearchResult>({
      index: this.index,
      body: {
        from: 0,
        size: 20,
        query: {
          multi_match: {
            query: query,
            fields: ['content', 'content.h1', 'content.p']
          }
        }
      }
    })
    const hits = body.hits.hits;
    
    return hits.map((item) => item._source);
  }

  async updateView(_id: ObjectId): Promise<any> {
    const res = await this.postModel.updateOne(
      { _id },
      { $inc: { view: 1 } }
    );
    return res
  }

}
