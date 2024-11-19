import {
  Attachment as PrismaAttachment,
  Prisma,
  User as PrismaUser,
} from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'

import { PrismaAttachmentMapper } from './prisma-attachment-mapper'

export class PrismaSellerMapper {
  static toDomain(raw: PrismaUser & { attachment?: PrismaAttachment }): Seller {
    return Seller.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        phone: raw.phone,
        avatarId: new UniqueEntityID(raw.avatarId),
        avatar: raw.attachment
          ? PrismaAttachmentMapper.toDomain(raw.attachment)
          : null,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(seller: Seller): Prisma.UserUncheckedCreateInput {
    return {
      id: seller.id.toString(),
      name: seller.name,
      email: seller.email,
      password: seller.password,
      phone: seller.phone,
      avatarId: seller.avatarId.toString(),
    }
  }
}
