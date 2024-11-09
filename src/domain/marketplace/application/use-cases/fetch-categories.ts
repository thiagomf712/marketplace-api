import { Injectable } from '@nestjs/common'

import { Either, right } from '@/core/either'
import { Category } from '@/domain/marketplace/enterprise/entities/category'

import { CategoriesRepository } from '../repositories/categories-repository'

type FetchCategoriesUseCaseResponse = Either<
  null,
  {
    categories: Category[]
  }
>

@Injectable()
export class FetchCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute(): Promise<FetchCategoriesUseCaseResponse> {
    const categories = await this.categoriesRepository.findMany()

    return right({
      categories,
    })
  }
}
