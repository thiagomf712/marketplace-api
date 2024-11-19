import { Injectable } from '@nestjs/common'

import { ProductsRepository } from '@/domain/marketplace/application/repositories/products-repository'
import { Product } from '@/domain/marketplace/enterprise/entities/product'

import { PrismaProductMapper } from '../mappers/prisma-product-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async create(product: Product): Promise<void> {
    const data = PrismaProductMapper.toPrisma(
      product,
      product.attachments.getItems(),
    )

    await this.prisma.product.create({
      data,
      include: {
        attachments: true,
      },
    })
  }
}
