import { Exclude, Expose, Transform } from 'class-transformer';
import { BaseDBObject } from './base.entity'

const S3_URL = process.env.S3_URL || ''
@Exclude()
export class UserEntity extends BaseDBObject {
  @Expose()
  public _id: string;

  @Expose()
  public username: string;

  @Expose()
  public about: string;

  @Expose()
  @Transform(value => value && value.value ? `${S3_URL}/${value.value}` : '')
  public avatar: string;
  
  @Expose()
  @Transform(value => value && value.value ? `${S3_URL}/${value.value}` : '')
  public banner?: string;

  constructor(partial: Partial<UserEntity>) {
    super()
    Object.assign(this, partial.toJSON());
  }
}

@Exclude()
export class UserProfileEntity extends BaseDBObject {
  @Expose()
  public _id: string;

  @Expose()
  public username: string;

  @Expose()
  public email: string

  @Expose()
  public about: string

  @Expose()
  public age: number

  @Expose()
  public gender: string

  @Expose()
  @Transform(value => value && value.value ? `${S3_URL}/${value.value}` : '')
  public avatar: string;
  
  @Expose()
  @Transform(value => value && value.value ? `${S3_URL}/${value.value}` : '')
  public banner?: string;

  constructor(partial: Partial<UserEntity>) {
    super()
    Object.assign(this, partial.toJSON());
  }
}