import { Module } from '@nestjs/common'

import { AttachmentsRepository } from '@/domain/marketplace/application/repositories/attachments-repository'
import { SellersRepository } from '@/domain/marketplace/application/repositories/sellers-repository'

import { PrismaService } from './prisma/prisma.service'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'
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
  ],
  exports: [PrismaService, AttachmentsRepository, SellersRepository],
})
export class DatabaseModule {}
