import { makeAttachment } from 'test/factories/make-attachment'
import { makeCategory } from 'test/factories/make-category'
import { makeProduct } from 'test/factories/make-product'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'

import { ProductStatus } from '../../enterprise/entities/product'
import { ProductAttachmentList } from '../../enterprise/entities/product-attachment-list'
import { GetProductByIdUseCase } from './get-product-by-id'

let inMemoryProductsRepository: InMemoryProductsRepository
let sut: GetProductByIdUseCase

describe('Get Product By Id', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductsRepository()

    sut = new GetProductByIdUseCase(inMemoryProductsRepository)
  })

  it('should be able to get a product', async () => {
    const seller = makeSeller()

    const category = makeCategory({ title: 'Category' })

    const [attachment1, attachment2] = [
      makeAttachment({ url: 'a-1' }),
      makeAttachment({ url: 'a-2' }),
    ]

    const product = makeProduct({
      attachments: new ProductAttachmentList([attachment1, attachment2]),
      title: 'Produto',
      category: category,
      owner: seller,
      status: ProductStatus.available,
      priceInCents: 5000,
    })

    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({ id: product.id.toString() })

    expect(result.isRight()).toBe(true)

    if (result.isLeft()) {
      throw new Error()
    }

    expect(result.value.product.id.toString()).toEqual(product.id.toString())
  })
})
