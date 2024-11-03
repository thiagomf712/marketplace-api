import { Module } from '@nestjs/common'

import { AttachmentsRepository } from '@/domain/marketplace/application/repositories/attachments-repository'

import { PrismaService } from './prisma/prisma.service'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: AttachmentsRepository,
      useClass: PrismaAttachmentsRepository,
    },
  ],
  exports: [PrismaService, AttachmentsRepository],
})
export class DatabaseModule {}
