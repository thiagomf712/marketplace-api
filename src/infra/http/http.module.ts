import { Module } from '@nestjs/common'

import { AuthenticateSellerUseCase } from '@/domain/marketplace/application/use-cases/authenticate-seller'
import { CreateProductUseCase } from '@/domain/marketplace/application/use-cases/create-product'
import { FetchCategoriesUseCase } from '@/domain/marketplace/application/use-cases/fetch-categories'
import { FetchProductsBySellerUseCase } from '@/domain/marketplace/application/use-cases/fetch-products-by-seller'
import { FetchProductsRecentUseCase } from '@/domain/marketplace/application/use-cases/fetch-products-recents'
import { GetProductByIdUseCase } from '@/domain/marketplace/application/use-cases/get-product-by-id'
import { RegisterSellerUseCase } from '@/domain/marketplace/application/use-cases/register-seller'
import { UpdateProductUseCase } from '@/domain/marketplace/application/use-cases/update-product'
import { UploadAttachmentUseCase } from '@/domain/marketplace/application/use-cases/upload-attachments'

import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { EnvModule } from '../env/env.module'
import { StorageModule } from '../storage/storage.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateProductController } from './controllers/create-product.controller'
import { CreateSellerController } from './controllers/create-seller.controller'
import { FetchCategoriesController } from './controllers/fetch-categories.controller'
import { FetchProductsBySellerController } from './controllers/fetch-products-by-seller.controller'
import { FetchProductsRecentController } from './controllers/fetch-products-recent.controller'
import { GetAttachmentByUrlController } from './controllers/get-attachment-by-url.controller'
import { GetProductByIdController } from './controllers/get-product-by-id.controller'
import { SignOutController } from './controllers/sign-out.controller'
import { UpdateProductController } from './controllers/update-product.controller'
import { UploadAttachmentController } from './controllers/upload-attachment.controller'

@Module({
  imports: [EnvModule, DatabaseModule, StorageModule, CryptographyModule],
  controllers: [
    AuthenticateController,
    SignOutController,
    UploadAttachmentController,
    GetAttachmentByUrlController,
    CreateSellerController,
    FetchCategoriesController,
    CreateProductController,
    UpdateProductController,
    FetchProductsBySellerController,
    FetchProductsRecentController,
    GetProductByIdController,
  ],
  providers: [
    UploadAttachmentUseCase,
    RegisterSellerUseCase,
    AuthenticateSellerUseCase,
    FetchCategoriesUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    FetchProductsBySellerUseCase,
    FetchProductsRecentUseCase,
    GetProductByIdUseCase,
  ],
})
export class HttpModule {}
