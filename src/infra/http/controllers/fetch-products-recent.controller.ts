import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'

import { FetchProductsRecentUseCase } from '@/domain/marketplace/application/use-cases/fetch-products-recents'
import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { ProductPresenter } from '../presenters/product-presenter'

const recentProductsParamSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
  search: z.string().optional(),
  status: z.string().optional().pipe(z.nativeEnum(ProductStatus).optional()),
})

const queryValidationPipe = new ZodValidationPipe(recentProductsParamSchema)

type RecenteProductsParamSchema = z.infer<typeof recentProductsParamSchema>

@Controller('/products')
export class FetchProductsRecentController {
  constructor(private fetchProductsRecent: FetchProductsRecentUseCase) {}

  @Get()
  async handle(@Query(queryValidationPipe) query: RecenteProductsParamSchema) {
    const result = await this.fetchProductsRecent.execute({
      page: query.page,
      search: query.search,
      status: query.status,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const products = result.value.products

    return { products: products.map(ProductPresenter.toHTTP) }
  }
}
