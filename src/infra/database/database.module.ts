import { Module } from '@nestjs/common'

import { AttachmentsRepository } from '@/domain/marketplace/application/repositories/attachments-repository'
import { CategoriesRepository } from '@/domain/marketplace/application/repositories/categories-repository'
import { SellersRepository } from '@/domain/marketplace/application/repositories/sellers-repository'

import { PrismaService } from './prisma/prisma.service'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'
import { PrismaCategoriesRepository } from './prisma/repositories/prisma-categories-repository'
import { PrismaSellersRepository } from './prisma/repositories/prisma-sellers-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: AttachmentsRepository,
      useClass: PrismaAttachmentsRepository,
    },
    {
      provide: SellersRepository,
      useClass: PrismaSellersRepository,
    },
    {
      provide: CategoriesRepository,
      useClass: PrismaCategoriesRepository,
    },
  ],
  exports: [
    PrismaService,
    AttachmentsRepository,
    SellersRepository,
    CategoriesRepository,
  ],
})
export class DatabaseModule {}
