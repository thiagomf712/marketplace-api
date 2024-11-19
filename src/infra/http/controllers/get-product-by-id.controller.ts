import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetProductByIdUseCase } from '@/domain/marketplace/application/use-cases/get-product-by-id'

import { ProductPresenter } from '../presenters/product-presenter'

@Controller('/products/:id')
export class GetProductByIdController {
  constructor(private getProductById: GetProductByIdUseCase) {}

  @Get()
  async handle(@Param('id') id: string) {
    const result = await this.getProductById.execute({ id })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(
            'The product, seller, category or attachments were not found.',
          )

        default:
          throw new BadRequestException(error.message)
      }
    }

    const product = result.value.product

    return {
      product: ProductPresenter.toHTTP(product),
    }
  }
}
