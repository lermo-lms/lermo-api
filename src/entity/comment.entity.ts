import { Exclude, Expose, Transform } from 'class-transformer';
import { BaseDBObject } from './base.entity'
import { Diff } from 'src/common/util/util'


const S3_URL = process.env.S3_URL || ''
@Exclude()
export class CommentEntity extends BaseDBObject {
  @Expose()
  username: string

  @Expose()
  @Transform(value => value && value.value ? `${S3_URL}/${value.value}` : '')
  avatar: string

  @Expose()
  message: string

  @Expose()
  @Transform(value => value && value.value ? Diff(value.value) : '')
  createdAt: string | Date

  constructor(partial: Partial<CommentEntity>) {
    super()
    Object.assign(this, partial);
  }
}