import { Prisma } from '@prisma/client'

import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'
import { Product } from '@/domain/marketplace/enterprise/entities/product'

export class PrismaProductMapper {
  // static toDomain(raw: PrismaProduct): Product {
  //   return Product.create(
  //     {
  //       description: raw.description,
  //       ownerId: new UniqueEntityID(raw.ownerId),
  //       priceInCents: raw.priceInCents,
  //       status: raw.status as ProductStatus,
  //       title: raw.title,
  //       createdAt: raw.createdAt,
  //       updatedAt: raw.updatedAt,

  //       email: raw.email,
  //       password: raw.password,
  //       phone: raw.phone,
  //       avatarId: new UniqueEntityID(raw.avatarId),
  //     },
  //     new UniqueEntityID(raw.id),
  //   )
  // }

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
