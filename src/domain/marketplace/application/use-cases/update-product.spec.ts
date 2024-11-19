import { makeAttachment } from 'test/factories/make-attachment'
import { makeCategory } from 'test/factories/make-category'
import { makeProduct } from 'test/factories/make-product'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'

import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

import { ProductStatus } from '../../enterprise/entities/product'
import { ProductAttachmentList } from '../../enterprise/entities/product-attachment-list'
import { UpdateProductUseCase } from './update-product'

let inMemoryProductsRepository: InMemoryProductsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let sut: UpdateProductUseCase

describe('Update Product', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()

    inMemoryProductsRepository = new InMemoryProductsRepository()

    inMemorySellersRepository = new InMemorySellersRepository()

    sut = new UpdateProductUseCase(
      inMemoryProductsRepository,
      inMemoryCategoriesRepository,
      inMemoryAttachmentsRepository,
    )
  })

  it('should be able to update a product', async () => {
    const seller = makeSeller()

    inMemorySellersRepository.items.push(seller)

    const [categoryOld, categoryNew] = [
      makeCategory({ title: 'Antiga' }),
      makeCategory({ title: 'Nova' }),
    ]

    inMemoryCategoriesRepository.items.push(categoryOld, categoryNew)

    const [attachment1, attachment2, attachment3] = [
      makeAttachment({ url: 'a-1' }),
      makeAttachment({ url: 'a-2' }),
      makeAttachment({ url: 'a-3' }),
    ]

    inMemoryAttachmentsRepository.items.push(
      attachment1,
      attachment2,
      attachment3,
    )

    const product = makeProduct({
      attachments: new ProductAttachmentList([attachment1, attachment2]),
      title: 'Produto antigo',
      category: categoryOld,
      owner: seller,
      status: ProductStatus.available,
      priceInCents: 5000,
    })

    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      productId: product.id.toString(),
      title: 'Novo Produto',
      description: 'Descrição do produto',
      categoryId: categoryNew.id.toString(),
      priceInCents: 3000,
      attachmentsIds: [attachment1.id.toString(), attachment3.id.toString()],
    })

    expect(result.isRight()).toBe(true)

    if (result.isLeft()) {
      throw new Error()
    }

    const updatedProduct = result.value.product

    expect(inMemoryProductsRepository.items[0]).toEqual(updatedProduct)

    expect(
      inMemoryProductsRepository.items[0].attachments.getItems(),
    ).toHaveLength(2)

    expect(inMemoryProductsRepository.items[0].attachments.getItems()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: 'a-1',
        }),
        expect.objectContaining({
          url: 'a-3',
        }),
      ]),
    )
  })

  it('should not be able to update a product that does not exist', async () => {
    const seller = makeSeller()

    inMemorySellersRepository.items.push(seller)

    const category = makeCategory({ title: 'Categoria' })

    inMemoryCategoriesRepository.items.push(category)

    const [attachment1, attachment2] = [
      makeAttachment({ url: 'a-1' }),
      makeAttachment({ url: 'a-2' }),
    ]

    inMemoryAttachmentsRepository.items.push(attachment1, attachment2)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      productId: 'non-existing-product-id',
      title: 'Novo Produto',
      description: 'Descrição do produto',
      categoryId: category.id.toString(),
      priceInCents: 3000,
      attachmentsIds: [attachment1.id.toString(), attachment2.id.toString()],
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a product that does not belong to you', async () => {
    const seller = makeSeller()
    const anotherSeller = makeSeller()

    inMemorySellersRepository.items.push(seller, anotherSeller)

    const category = makeCategory({ title: 'Categoria' })

    inMemoryCategoriesRepository.items.push(category)

    const [attachment1, attachment2] = [
      makeAttachment({ url: 'a-1' }),
      makeAttachment({ url: 'a-2' }),
    ]

    inMemoryAttachmentsRepository.items.push(attachment1, attachment2)

    const product = makeProduct({
      attachments: new ProductAttachmentList([attachment1, attachment2]),
      title: 'Produto',
      category: category,
      owner: anotherSeller,
      status: ProductStatus.available,
      priceInCents: 5000,
    })

    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      productId: product.id.toString(),
      title: 'Novo Produto',
      description: 'Descrição do produto',
      categoryId: category.id.toString(),
      priceInCents: 3000,
      attachmentsIds: [attachment1.id.toString(), attachment2.id.toString()],
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to update a product that has the status sold', async () => {
    const seller = makeSeller()

    inMemorySellersRepository.items.push(seller)

    const category = makeCategory({ title: 'Categoria' })

    inMemoryCategoriesRepository.items.push(category)

    const [attachment1, attachment2] = [
      makeAttachment({ url: 'a-1' }),
      makeAttachment({ url: 'a-2' }),
    ]

    inMemoryAttachmentsRepository.items.push(attachment1, attachment2)

    const product = makeProduct({
      attachments: new ProductAttachmentList([attachment1, attachment2]),
      title: 'Produto',
      category: category,
      owner: seller,
      status: ProductStatus.sold,
      priceInCents: 5000,
    })

    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      productId: product.id.toString(),
      title: 'Novo Produto',
      description: 'Descrição do produto',
      categoryId: category.id.toString(),
      priceInCents: 3000,
      attachmentsIds: [attachment1.id.toString(), attachment2.id.toString()],
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
