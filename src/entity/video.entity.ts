import { Exclude, Expose, Transform } from 'class-transformer';
import { BaseDBObject } from './base.entity'
import { msToTime } from 'src/common/util/util'
import { Diff } from 'src/common/util/util'

const S3_URL = process.env.S3_URL || ''
const CDN = process.env.CDN || ""
const LIVE_ENDPOINT = process.env.LIVE_ENDPOINT || ""


@Exclude()
export class VideoEntity extends BaseDBObject {

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  videoKey: string;

  @Expose()
  videoType: string;

  @Expose()
  paymantType: string;

  @Expose()
  view: number;

  @Expose()
  userId: string;

  @Expose()
  about: string;

  @Expose()
  enableDonation: boolean;

  @Expose()
  price: number;

  @Expose()
  freeMinute: number;

  @Expose()
  @Transform(value => value && value.value ? `${S3_URL}/${value.value}` : '')
  thumbnail: string;

  @Expose()
  tags: string[];

  @Expose()
  categories: string[];

  @Expose()
  status: string;

  @Expose()
  videoPath: string;

  @Expose()
  videoName: string

  @Expose()
  @Transform(value => value && value.value ? msToTime(value.value) : '0m')
  videoDuration

  @Expose()
  username: string

  @Expose()
  @Transform(value => value && value.value ? `${S3_URL}/${value.value}` : '')
  avatar: string

  @Expose()
  @Transform(value => checkVideoType(`${value.obj['videoType']}`, value))
  // @Transform(value => value && value.value ? `${CDN}/${value.value}/index.m3u8` : '')
  videoUrl: string

  @Expose()
  @Transform(value => value && value.value ? Diff(value.value) : '')
  createdAt: string | Date


  constructor(partial: Partial<VideoEntity>) {
    super()
    Object.assign(this, partial);
  }
}
@Exclude()
export class VideoKeyEntity extends BaseDBObject {
  @Expose()
  _id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  videoType: string;

  constructor(partial: Partial<VideoEntity>) {
    super()
    Object.assign(this, partial);
  }
}

const checkVideoType = (videoType, value) => {
  if (videoType === 'live') {
    return `${CDN}/${value.obj['_id']}/index.m3u8`
  } else if (videoType === 'video') {
    return `${CDN}/${value.value}/index.m3u8`
  } else {
    return ''
  }
}
