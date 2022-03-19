import { Exclude, Expose, Transform } from 'class-transformer';
import { BaseDBObject } from './base.entity'
import { Diff } from 'src/common/util/util'

const S3_URL = process.env.S3_URL || ''
const CDN = process.env.CDN || ""

@Exclude()
export class PostEntity extends BaseDBObject {
  @Expose()
  title: string

  @Expose()
  description: string

  @Expose()
  thumbnail: string
  
  @Expose()
  contentRAW: JSON

  @Expose()
  contentHTML: string

  @Expose()
  username: string

  @Expose()
  userId: string
  
  @Expose()
  postType: string

  @Expose()
  @Transform(value => value && value.value ? `${S3_URL}/${value.value}` : '')
  avatar: string

  @Expose()
  status: string

  @Expose()
  view: number

  @Expose()
  @Transform(value => value && value.value ? Diff(value.value) : '')
  createdAt: string | Date

  constructor(partial: Partial<PostEntity>) {
    super()
    Object.assign(this, partial);
  }
}

@Exclude()
export class PostImageEntity extends BaseDBObject {
  @Expose()
  @Transform(value => value && value.value ? `${S3_URL}/${value.value}` : '')
  imageUrl: string;

  constructor(partial: Partial<PostImageEntity>) {
    super()
    Object.assign(this, partial);
  }
}