import { SendEmailRequest, SendEmailResponse } from 'aws-sdk/clients/ses';

export interface IStorageService {
  bucket: string;
  region: string;
  bucketURL: string;
  S3: any;

  uploadFile(
    rawImage: Buffer,
    targetURI: string,
    acl?: string,
  ): Promise<ResUploadFile>;
  getUrl(URI: string): string;
  getLocationPath(key: string): string;
  sendEmail(params: SendEmailRequest ): Promise<SendEmailResponse>;
}

export enum UploadKey {
  AVARTAR = 'user-avatar',
  BANNER = 'user-banner',
  VIDEO_THUMBNAIL = 'video-thumbnail',
  VIDEO_SOURCE = 'video-source',
  POST_IMAGE = 'post-image',
  CLASSROOM_COVER = 'classroom-cover'
}

export type ResUploadFile = {
  Key: string;
  Location: string;
};
