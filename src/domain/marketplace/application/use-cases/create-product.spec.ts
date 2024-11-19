import { makeAttachment } from 'test/factories/make-attachment'
import { makeCategory } from 'test/factories/make-category'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

import { CreateProductUseCase } from './create-product'

let inMemoryProductsRepository: InMemoryProductsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let sut: CreateProductUseCase

describe('Create Product', () => {
  beforeEach(() => {
    inMemorySellersRepository = new InMemorySellersRepository()

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()

    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new CreateProductUseCase(
      inMemoryProductsRepository,
      inMemorySellersRepository,
      inMemoryCategoriesRepository,
      inMemoryAttachmentsRepository,
    )
  })

  it('should be able to create a product', async () => {
    const owner = makeSeller()

    inMemorySellersRepository.items.push(owner)

    const category = makeCategory()

    inMemoryCategoriesRepository.items.push(category)

    const [attachment1, attachment2] = [makeAttachment(), makeAttachment()]

    inMemoryAttachmentsRepository.items.push(attachment1, attachment2)

    const result = await sut.execute({
      ownerId: owner.id.toString(),
      title: 'Novo Produto',
      description: 'Descrição do produto',
      categoryId: category.id.toString(),
      priceInCents: 5000,
      attachmentsIds: [attachment1.id.toString(), attachment2.id.toString()],
    })

    expect(result.isRight()).toBe(true)

    if (result.isLeft()) {
      throw new Error()
    }

    expect(inMemoryProductsRepository.items[0]).toEqual(result.value.product)

    expect(
      inMemoryProductsRepository.items[0].attachments.getItems(),
    ).toHaveLength(2)
  })

  it('should not be able to create a product if owner does not exist', async () => {
    const category = makeCategory()

    inMemoryCategoriesRepository.items.push(category)

    const [attachment1, attachment2] = [makeAttachment(), makeAttachment()]

    inMemoryAttachmentsRepository.items.push(attachment1, attachment2)

    const result = await sut.execute({
      ownerId: 'non-existent-owner-id',
      title: 'Novo Produto',
      description: 'Descrição do produto',
      categoryId: category.id.toString(),
      priceInCents: 5000,
      attachmentsIds: [attachment1.id.toString(), attachment2.id.toString()],
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a product if category does not exist', async () => {
    const owner = makeSeller()

    inMemorySellersRepository.items.push(owner)

    const [attachment1, attachment2] = [makeAttachment(), makeAttachment()]

    inMemoryAttachmentsRepository.items.push(attachment1, attachment2)

    const result = await sut.execute({
      ownerId: owner.id.toString(),
      title: 'Novo Produto',
      description: 'Descrição do produto',
      categoryId: 'non-existent-category-id',
      priceInCents: 5000,
      attachmentsIds: [attachment1.id.toString(), attachment2.id.toString()],
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a product if any attachment does not exist', async () => {
    const owner = makeSeller()

    inMemorySellersRepository.items.push(owner)

    const category = makeCategory()

    inMemoryCategoriesRepository.items.push(category)

    const attachment1 = makeAttachment()

    inMemoryAttachmentsRepository.items.push(attachment1)

    const result = await sut.execute({
      ownerId: owner.id.toString(),
      title: 'Novo Produto',
      description: 'Descrição do produto',
      categoryId: category.id.toString(),
      priceInCents: 5000,
      attachmentsIds: [attachment1.id.toString(), 'non-existent-attachment-id'],
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
