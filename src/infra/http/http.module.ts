import { Module } from '@nestjs/common'

import { AuthenticateSellerUseCase } from '@/domain/marketplace/application/use-cases/authenticate-seller'
import { RegisterSellerUseCase } from '@/domain/marketplace/application/use-cases/register-seller'
import { UploadAttachmentUseCase } from '@/domain/marketplace/application/use-cases/upload-attachments'

import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { EnvModule } from '../env/env.module'
import { StorageModule } from '../storage/storage.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateSellerController } from './controllers/create-seller.controller'
import { GetAttachmentByUrlController } from './controllers/get-attachment-by-url.controller'
import { SignOutController } from './controllers/sign-out.controller'
import { UploadAttachmentController } from './controllers/upload-attachment.controller'

@Module({
  imports: [EnvModule, DatabaseModule, StorageModule, CryptographyModule],
  controllers: [
    AuthenticateController,
    SignOutController,
    UploadAttachmentController,
    GetAttachmentByUrlController,
    CreateSellerController,
  ],
  providers: [
    UploadAttachmentUseCase,
    RegisterSellerUseCase,
    AuthenticateSellerUseCase,
  ],
})
export class HttpModule {}
