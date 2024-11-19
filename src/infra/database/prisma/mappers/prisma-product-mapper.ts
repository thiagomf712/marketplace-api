import {
  Attachment as PrismaAttachments,
  Category as PrismaCategory,
  Prisma,
  Product as PrismaProduct,
  User as PrismaUser,
} from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'
import {
  Product,
  ProductStatus,
} from '@/domain/marketplace/enterprise/entities/product'
import { ProductAttachmentList } from '@/domain/marketplace/enterprise/entities/product-attachment-list'

import { PrismaAttachmentMapper } from './prisma-attachment-mapper'
import { PrismaCategoryMapper } from './prisma-category-mapper'
import { PrismaSellerMapper } from './prisma-seller-mapper'

type PrismaProductWithDetails = PrismaProduct & {
  category: PrismaCategory
  attachments: PrismaAttachments[]
  owner: PrismaUser
}

export class PrismaProductMapper {
  static toDomain(raw: PrismaProductWithDetails): Product {
    return Product.create(
      {
        description: raw.description,
        ownerId: new UniqueEntityID(raw.ownerId),
        priceInCents: raw.priceInCents,
        status: raw.status as ProductStatus,
        title: raw.title,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        category: PrismaCategoryMapper.toDomain(raw.category),
        attachments: new ProductAttachmentList(
          raw.attachments.map(PrismaAttachmentMapper.toDomain),
        ),
        categoryId: new UniqueEntityID(raw.categoryId),
        owner: PrismaSellerMapper.toDomain(raw.owner),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    product: Product,
    attachments: Attachment[],
  ): Prisma.ProductUncheckedCreateInput {
    const attachmentsId = attachments.map((item) => ({
      id: item.id.toString(),
    }))

    return {
      id: product.id.toString(),
      description: product.description,
      ownerId: product.ownerId.toString(),
      priceInCents: product.priceInCents,
      categoryId: product.categoryId.toString(),
      status: product.status,
      title: product.title,
      attachments: {
        connect: attachmentsId,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}
