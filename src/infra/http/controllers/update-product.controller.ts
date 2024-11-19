import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { z } from 'zod'

import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UpdateProductUseCase } from '@/domain/marketplace/application/use-cases/update-product'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { ProductPresenter } from '../presenters/product-presenter'

const updateProductBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  categoryId: z.string().uuid(),
  priceInCents: z.number().int().positive(),
  attachmentsIds: z.array(z.string().uuid()),
})

const bodyValidationPipe = new ZodValidationPipe(updateProductBodySchema)

type UpdateProductBodySchema = z.infer<typeof updateProductBodySchema>

@Controller('/products/:id')
export class UpdateProductController {
  constructor(private updateProduct: UpdateProductUseCase) {}

  @Put()
  async handle(
    @Param('id') id: string,
    @Body(bodyValidationPipe) body: UpdateProductBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    const result = await this.updateProduct.execute({
      attachmentsIds: body.attachmentsIds,
      categoryId: body.categoryId,
      description: body.description,
      sellerId: userId,
      priceInCents: body.priceInCents,
      title: body.title,
      productId: id,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(
            'The product, seller, category or attachments were not found.',
          )

        case NotAllowedError:
          throw new ForbiddenException(
            'You are not the owner of this product or the product is sold.',
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
