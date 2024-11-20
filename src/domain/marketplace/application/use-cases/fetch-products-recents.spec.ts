import { makeProduct } from 'test/factories/make-product'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'

import { ProductStatus } from '../../enterprise/entities/product'
import { FetchProductsRecentUseCase } from './fetch-products-recents'

let inMemoryProductsRepository: InMemoryProductsRepository
let sut: FetchProductsRecentUseCase

describe('Fetch Recent Products', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new FetchProductsRecentUseCase(inMemoryProductsRepository)
  })

  it('should be able to fetch recent products', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct({ createdAt: new Date(2022, 0, 20) }),
      makeProduct({ createdAt: new Date(2022, 0, 18) }),
      makeProduct({ createdAt: new Date(2022, 0, 23) }),
    )

    const result = await sut.execute({
      page: 1,
    })

    expect(result.value?.products).toEqual([
      expect.objectContaining({ createdAt: new Date(2022, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 18) }),
    ])
  })

  it('should be able to fetch paginated recent products', async () => {
    for (let i = 1; i <= 22; i++) {
      inMemoryProductsRepository.items.push(makeProduct())
    }

    const result = await sut.execute({
      page: 2,
    })

    expect(result.value?.products).toHaveLength(2)
  })

  it('should be able to filter products by a specific title', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct({ title: 'Product A', createdAt: new Date(2022, 0, 20) }),
      makeProduct({ title: 'Product B', createdAt: new Date(2022, 0, 18) }),
      makeProduct({ title: 'Product A', createdAt: new Date(2022, 0, 23) }),
    )

    const result = await sut.execute({
      page: 1,
      search: 'Product A',
    })

    expect(result.value?.products).toEqual([
      expect.objectContaining({
        title: 'Product A',
        createdAt: new Date(2022, 0, 23),
      }),
      expect.objectContaining({
        title: 'Product A',
        createdAt: new Date(2022, 0, 20),
      }),
    ])
  })

  it('should be able to filter products by a specific status', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct({
        status: ProductStatus.available,
        createdAt: new Date(2022, 0, 20),
      }),
      makeProduct({
        status: ProductStatus.sold,
        createdAt: new Date(2022, 0, 18),
      }),
      makeProduct({
        status: ProductStatus.available,
        createdAt: new Date(2022, 0, 23),
      }),
    )

    const result = await sut.execute({
      page: 1,
      status: ProductStatus.available,
    })

    expect(result.value?.products).toEqual([
      expect.objectContaining({
        status: ProductStatus.available,
        createdAt: new Date(2022, 0, 23),
      }),
      expect.objectContaining({
        status: ProductStatus.available,
        createdAt: new Date(2022, 0, 20),
      }),
    ])
  })
})
