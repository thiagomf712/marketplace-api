import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { FetchProductsBySellerUseCase } from '@/domain/marketplace/application/use-cases/fetch-products-by-seller'
import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { ProductPresenter } from '../presenters/product-presenter'

const productsBySellerParamsSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional().pipe(z.nativeEnum(ProductStatus).optional()),
})

const queryValidationPipe = new ZodValidationPipe(productsBySellerParamsSchema)

type ProductsBySellerParamsSchema = z.infer<typeof productsBySellerParamsSchema>

@Controller('/products/me')
export class FetchProductsBySellerController {
  constructor(private fetchProductsBySeller: FetchProductsBySellerUseCase) {}

  @Get()
  async handle(
    @Query(queryValidationPipe) query: ProductsBySellerParamsSchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.fetchProductsBySeller.execute({
      sellerId: user.sub,
      search: query.search,
      status: query.status,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException('The seller was not found.')

        default:
          throw new BadRequestException(error.message)
      }
    }

    const products = result.value.products

    return { products: products.map(ProductPresenter.toHTTP) }
  }
}
