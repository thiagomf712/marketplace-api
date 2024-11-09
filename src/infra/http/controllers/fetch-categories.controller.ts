import { BadRequestException, Controller, Get } from '@nestjs/common'

import { FetchCategoriesUseCase } from '@/domain/marketplace/application/use-cases/fetch-categories'

import { CategoryPresenter } from '../presenters/category-presenter'

@Controller('categories')
export class FetchCategoriesController {
  constructor(private fetchCategoriesUseCase: FetchCategoriesUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchCategoriesUseCase.execute()

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const categories = result.value.categories

    return {
      categories: categories.map(CategoryPresenter.toHTTP),
    }
  }
}
