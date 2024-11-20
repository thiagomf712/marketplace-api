import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { CategoryFactory } from 'test/factories/make-category'
import { ProductFactory } from 'test/factories/make-product'
import { SellerFactory } from 'test/factories/make-seller'

import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { ProductAttachmentList } from '@/domain/marketplace/enterprise/entities/product-attachment-list'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Fetch products by seller (E2E)', () => {
  let app: INestApplication
  let attachmentFactory: AttachmentFactory
  let sellerFactory: SellerFactory
  let categoryFactory: CategoryFactory
  let productFactory: ProductFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        SellerFactory,
        AttachmentFactory,
        CategoryFactory,
        ProductFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    app.use(cookieParser())

    attachmentFactory = moduleRef.get(AttachmentFactory)

    categoryFactory = moduleRef.get(CategoryFactory)

    sellerFactory = moduleRef.get(SellerFactory)

    productFactory = moduleRef.get(ProductFactory)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /products/me', async () => {
    const avatar = await attachmentFactory.makePrismaAttachment()

    const [user1, user2, category1, category2, attachment1, attachment2] =
      await Promise.all([
        sellerFactory.makePrismaSeller({
          avatarId: avatar.id,
          name: 'John',
        }),
        sellerFactory.makePrismaSeller({
          avatarId: avatar.id,
          name: 'Senna',
        }),
        categoryFactory.makePrismaCategory({ title: 'category-1' }),
        categoryFactory.makePrismaCategory({ title: 'category-2' }),
        attachmentFactory.makePrismaAttachment({ url: 'url-1' }),
        attachmentFactory.makePrismaAttachment({ url: 'url-2' }),
      ])

    await Promise.all([
      productFactory.makePrismaProduct({
        attachments: new ProductAttachmentList([attachment1, attachment2]),
        category: category1,
        owner: user1,
        status: ProductStatus.available,
        title: 'Product 1',
        priceInCents: 5000,
        description: 'Description',
      }),
      productFactory.makePrismaProduct({
        attachments: new ProductAttachmentList([attachment1, attachment2]),
        category: category2,
        owner: user2,
        status: ProductStatus.available,
        title: 'Product 2',
        priceInCents: 3000,
        description: 'Description',
      }),
      productFactory.makePrismaProduct({
        attachments: new ProductAttachmentList([attachment1, attachment2]),
        category: category2,
        owner: user1,
        status: ProductStatus.available,
        title: 'Product 3',
        priceInCents: 2000,
        description: 'Description',
      }),
    ])

    const accessToken = jwt.sign({ sub: user1.id.toString() })

    const response = await request(app.getHttpServer())
      .get(`/products/me`)
      .set('Cookie', [`access-token=${accessToken}`])
      .send()

    expect(response.statusCode).toBe(200)

    expect(response.body.products).toHaveLength(2)

    expect(response.body.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Product 1',
          priceInCents: 5000,
          category: expect.objectContaining({
            title: 'category-1',
          }),
          attachments: expect.arrayContaining([
            expect.objectContaining({ url: 'url-1' }),
            expect.objectContaining({ url: 'url-2' }),
          ]),
          owner: expect.objectContaining({
            name: 'John',
            avatar: expect.objectContaining({ url: avatar.url }),
          }),
        }),
        expect.objectContaining({
          title: 'Product 3',
          priceInCents: 2000,
          category: expect.objectContaining({
            title: 'category-2',
          }),
          attachments: expect.arrayContaining([
            expect.objectContaining({ url: 'url-1' }),
            expect.objectContaining({ url: 'url-2' }),
          ]),
          owner: expect.objectContaining({
            name: 'John',
            avatar: expect.objectContaining({ url: avatar.url }),
          }),
        }),
      ]),
    )
  })
})
