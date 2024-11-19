import { Injectable } from '@nestjs/common'

import { ProductsRepository } from '@/domain/marketplace/application/repositories/products-repository'
import { Product } from '@/domain/marketplace/enterprise/entities/product'

import { PrismaProductMapper } from '../mappers/prisma-product-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        attachments: true,
        category: true,
        owner: { include: { attachment: true } },
      },
    })

    if (!product) {
      return null
    }

    return PrismaProductMapper.toDomain(product)
  }

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

  async save(product: Product): Promise<void> {
    const data = PrismaProductMapper.toPrisma(
      product,
      product.attachments.getItems(),
    )

    await this.prisma.product.update({
      where: {
        id: product.id.toString(),
      },
      data,
      include: {
        attachments: true,
      },
    })
  }
}
