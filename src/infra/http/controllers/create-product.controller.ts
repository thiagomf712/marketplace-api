import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { CreateProductUseCase } from '@/domain/marketplace/application/use-cases/create-product'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { ProductPresenter } from '../presenters/product-presenter'

const createProductBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  categoryId: z.string().uuid(),
  priceInCents: z.number().int().positive(),
  attachmentsIds: z.array(z.string().uuid()),
})

const bodyValidationPipe = new ZodValidationPipe(createProductBodySchema)

type CreateProductBodySchema = z.infer<typeof createProductBodySchema>

@Controller('/products')
export class CreateProductController {
  constructor(private createProduct: CreateProductUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateProductBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    const result = await this.createProduct.execute({
      attachmentsIds: body.attachmentsIds,
      categoryId: body.categoryId,
      description: body.description,
      ownerId: userId,
      priceInCents: body.priceInCents,
      title: body.title,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(
            'The seller, category or attachments were not found.',
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
