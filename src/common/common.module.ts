import { Module, Global } from '@nestjs/common';

import { AwsService } from './services/aws/aws.service';
import { TYPES } from './types';
// import { MinioService } from './services/minio/minio.service';

const storageProvider = {
  provide: TYPES.IStorageService,
  useClass: AwsService
}
@Global()
@Module({
  providers: [storageProvider],
  exports: [storageProvider]
})
export class CommonModule {}
