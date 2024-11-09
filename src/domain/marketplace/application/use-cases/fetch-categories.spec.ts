import { makeCategory } from 'test/factories/make-category'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories-repository'

import { FetchCategoriesUseCase } from './fetch-categories'

let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let sut: FetchCategoriesUseCase

describe('Fetch  Categories', () => {
  beforeEach(() => {
    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()

    sut = new FetchCategoriesUseCase(inMemoryCategoriesRepository)
  })

  it('should be able to fetch  categories', async () => {
    inMemoryCategoriesRepository.items.push(
      makeCategory({ title: 'Category 1' }),
      makeCategory({ title: 'Category 2' }),
      makeCategory({ title: 'Category 3' }),
    )

    const result = await sut.execute()

    expect(result.value?.categories).toEqual([
      expect.objectContaining({ title: 'Category 1' }),
      expect.objectContaining({ title: 'Category 2' }),
      expect.objectContaining({ title: 'Category 3' }),
    ])
  })
})
