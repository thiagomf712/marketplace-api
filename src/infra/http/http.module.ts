import { Module } from '@nestjs/common'

import { UploadAttachmentUseCase } from '@/domain/marketplace/application/use-cases/upload-attachments'

import { DatabaseModule } from '../database/database.module'
import { EnvModule } from '../env/env.module'
import { StorageModule } from '../storage/storage.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { GetAttachmentByUrlController } from './controllers/get-attachment-by-url.controller'
import { SignOutController } from './controllers/sign-out.controller'
import { UploadAttachmentController } from './controllers/upload-attachment.controller'

@Module({
  imports: [EnvModule, DatabaseModule, StorageModule],
  controllers: [
    AuthenticateController,
    SignOutController,
    UploadAttachmentController,
    GetAttachmentByUrlController,
  ],
  providers: [UploadAttachmentUseCase],
})
export class HttpModule {}
