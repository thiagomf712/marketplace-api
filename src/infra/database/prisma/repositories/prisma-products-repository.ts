import { Injectable } from '@nestjs/common'

import {
  FindManyProductsRecentParams,
  ProductsRepository,
} from '@/domain/marketplace/application/repositories/products-repository'
import { Product } from '@/domain/marketplace/enterprise/entities/product'

import { PrismaProductMapper } from '../mappers/prisma-product-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async findManyRecent(
    params: FindManyProductsRecentParams,
  ): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        status: params.status,
        OR: params.search
          ? [
              {
                title: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
            ]
          : undefined,
      },
      include: {
        attachments: true,
        category: true,
        owner: { include: { attachment: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (params.page - 1) * 20,
      take: 20,
    })

    return products.map(PrismaProductMapper.toDomain)
  }

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
