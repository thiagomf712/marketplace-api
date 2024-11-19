import { Injectable } from '@nestjs/common'

import { CategoriesRepository } from '@/domain/marketplace/application/repositories/categories-repository'
import { Category } from '@/domain/marketplace/enterprise/entities/category'

import { PrismaCategoryMapper } from '../mappers/prisma-category-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany()

    return categories.map(PrismaCategoryMapper.toDomain)
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    })

    return category ? PrismaCategoryMapper.toDomain(category) : null
  }
}
