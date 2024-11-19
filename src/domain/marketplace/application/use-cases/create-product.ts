import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

import { Product, ProductStatus } from '../../enterprise/entities/product'
import { ProductAttachmentList } from '../../enterprise/entities/product-attachment-list'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { CategoriesRepository } from '../repositories/categories-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { SellersRepository } from '../repositories/sellers-repository'

interface CreateProductUseCaseRequest {
  ownerId: string
  title: string
  description: string
  categoryId: string
  priceInCents: number
  attachmentsIds: string[]
}

type CreateProductUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: Product
  }
>

@Injectable()
export class CreateProductUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private sellersRepository: SellersRepository,
    private categoriesRepository: CategoriesRepository,
    private attachmentsRepository: AttachmentsRepository,
  ) {}

  async execute({
    attachmentsIds,
    categoryId,
    description,
    ownerId,
    priceInCents,
    title,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const [seller, category, attachments] = await Promise.all([
      this.sellersRepository.findById(ownerId),
      this.categoriesRepository.findById(categoryId),
      this.attachmentsRepository.findManyByIds(attachmentsIds),
    ])

    if (!seller) {
      return left(new ResourceNotFoundError())
    }

    if (!category) {
      return left(new ResourceNotFoundError())
    }

    if (attachments.length !== attachmentsIds.length) {
      return left(new ResourceNotFoundError())
    }

    const product = Product.create({
      ownerId: new UniqueEntityID(ownerId),
      owner: seller,
      title,
      description,
      priceInCents,
      status: ProductStatus.available,
      category: category,
    })

    product.attachments = new ProductAttachmentList(attachments)

    await this.productsRepository.create(product)

    return right({
      product,
    })
  }
}
