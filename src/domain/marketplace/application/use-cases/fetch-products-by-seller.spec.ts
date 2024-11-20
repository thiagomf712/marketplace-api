import { makeProduct } from 'test/factories/make-product'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

import { ProductStatus } from '../../enterprise/entities/product'
import { FetchProductsBySellerUseCase } from './fetch-products-by-seller'

let inMemoryProductsRepository: InMemoryProductsRepository
let inMemorySellersRepository: InMemorySellersRepository
let sut: FetchProductsBySellerUseCase

describe('Fetch Products by seller', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository()

    inMemorySellersRepository = new InMemorySellersRepository()

    sut = new FetchProductsBySellerUseCase(
      inMemoryProductsRepository,
      inMemorySellersRepository,
    )
  })

  it('should be able to fetch products by seller', async () => {
    inMemorySellersRepository.items.push(
      makeSeller({}, new UniqueEntityID('1')),
    )

    inMemoryProductsRepository.items.push(
      makeProduct({ title: 'Produto 1', ownerId: new UniqueEntityID('1') }),
      makeProduct({ title: 'Produto 2', ownerId: new UniqueEntityID('1') }),
      makeProduct({ title: 'Produto 3', ownerId: new UniqueEntityID('2') }),
    )

    const result = await sut.execute({
      sellerId: '1',
    })

    expect(result.isRight()).toBe(true)

    if (result.isLeft()) {
      throw new Error()
    }

    expect(result.value?.products).toEqual([
      expect.objectContaining({ title: 'Produto 1' }),
      expect.objectContaining({ title: 'Produto 2' }),
    ])
  })

  it('should not be able to fetch products from a seller that does not exist', async () => {
    const result = await sut.execute({
      sellerId: 'non-existent-seller-id',
    })

    expect(result.isLeft()).toBe(true)

    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be able to filter products by a specific title', async () => {
    inMemorySellersRepository.items.push(
      makeSeller({}, new UniqueEntityID('1')),
    )

    inMemoryProductsRepository.items.push(
      makeProduct({ title: 'Product 1', ownerId: new UniqueEntityID('1') }),
      makeProduct({ title: 'Product 2', ownerId: new UniqueEntityID('1') }),
    )

    const result = await sut.execute({
      sellerId: '1',
      search: 'Product 1',
    })

    expect(result.isRight()).toBe(true)

    if (result.isLeft()) {
      throw new Error()
    }

    expect(result.value?.products).toEqual([
      expect.objectContaining({
        title: 'Product 1',
      }),
    ])
  })

  it('should be able to filter products by a specific status', async () => {
    inMemorySellersRepository.items.push(
      makeSeller({}, new UniqueEntityID('1')),
    )

    inMemoryProductsRepository.items.push(
      makeProduct({
        title: 'Product 1',
        status: ProductStatus.available,
        ownerId: new UniqueEntityID('1'),
      }),
      makeProduct({
        title: 'Product 2',
        status: ProductStatus.sold,
        ownerId: new UniqueEntityID('1'),
      }),
    )

    const result = await sut.execute({
      sellerId: '1',
      status: ProductStatus.sold,
    })

    expect(result.isRight()).toBe(true)

    if (result.isLeft()) {
      throw new Error()
    }

    expect(result.value?.products).toEqual([
      expect.objectContaining({
        title: 'Product 2',
      }),
    ])
  })
})
