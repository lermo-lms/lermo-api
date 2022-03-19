import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StringMap } from 'aws-sdk/clients/ecs';
import Minio from 'minio'

@Injectable()
export class MinioService {
  private minio: Minio.Client;
  private minioEndpoint: string;
  private minioBucket: string;
  private accessKeyId: string;
  private secretAccessKey: string;

  constructor(private readonly configService: ConfigService) {
    this.minioEndpoint = this.configService.get('MINIO_ENDPOINT'),
    this.minioBucket = this.configService.get('MINIO_BUCKET')
    this.accessKeyId = this.configService.get('MINIO_SECRET_ACCESS_KEY')
    this.secretAccessKey = this.configService.get('MINIO_ACCESS_KEY_ID')
    this.minio = new Minio.Client({
      endPoint: this.minioEndpoint,
      port: 9000,
      useSSL: false,
      accessKey: this.accessKeyId,
      secretKey: this.secretAccessKey
    })
  }

  // async uploadFile(bufferFile: Buffer, ): Promise<any> {
  //   this.minio.fPutObject(this.minioBucket,)
  // }
}
