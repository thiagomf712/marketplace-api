import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Product,
  ProductProps,
  ProductStatus,
} from '@/domain/marketplace/enterprise/entities/product'
import { PrismaProductMapper } from '@/infra/database/prisma/mappers/prisma-product-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

import { makeCategory } from './make-category'

export function makeProduct(
  override: Partial<ProductProps> = {},
  id?: UniqueEntityID,
) {
  const category = override.category ?? makeCategory()

  const product = Product.create(
    {
      title: faker.lorem.words({ min: 1, max: 3 }),
      description: faker.lorem.sentences(),
      priceInCents: faker.number.int({ min: 100, max: 10000 }),
      status: faker.helpers.enumValue(ProductStatus),
      categoryId: override.categoryId ?? category.id,
      category,
      ownerId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return product
}

@Injectable()
export class ProductFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaProduct(data: Partial<ProductProps> = {}): Promise<Product> {
    const product = makeProduct(data)

    await this.prisma.product.create({
      data: PrismaProductMapper.toPrisma(
        product,
        product.attachments.getItems(),
      ),
      include: {
        attachments: true,
      },
    })

    return product
  }
}
