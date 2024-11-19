import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

import { Product, ProductStatus } from '../../enterprise/entities/product'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { CategoriesRepository } from '../repositories/categories-repository'
import { ProductsRepository } from '../repositories/products-repository'

interface UpdateProductUseCaseRequest {
  productId: string
  sellerId: string
  title: string
  categoryId: string
  description: string
  priceInCents: number
  attachmentsIds: string[]
}

type UpdateProductUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    product: Product
  }
>

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private categoriesRepository: CategoriesRepository,
    private attachmentsRepository: AttachmentsRepository,
  ) {}

  async execute({
    attachmentsIds,
    categoryId,
    description,
    sellerId,
    productId,
    priceInCents,
    title,
  }: UpdateProductUseCaseRequest): Promise<UpdateProductUseCaseResponse> {
    const [product, category, attachments] = await Promise.all([
      this.productsRepository.findById(productId),
      this.categoriesRepository.findById(categoryId),
      this.attachmentsRepository.findManyByIds(attachmentsIds),
    ])

    if (!product) {
      return left(new ResourceNotFoundError())
    }

    if (product.ownerId.toString() !== sellerId) {
      return left(new NotAllowedError())
    }

    if (product.status === ProductStatus.sold) {
      return left(new NotAllowedError())
    }

    if (!category) {
      return left(new ResourceNotFoundError())
    }

    if (attachments.length !== attachmentsIds.length) {
      return left(new ResourceNotFoundError())
    }

    product.title = title

    product.description = description

    product.category = category

    product.priceInCents = priceInCents

    product.attachments.update(attachments)

    await this.productsRepository.save(product)

    return right({
      product,
    })
  }
}
