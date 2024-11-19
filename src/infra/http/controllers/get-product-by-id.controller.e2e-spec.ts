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

describe('Get Product By (E2E)', () => {
  let app: INestApplication
  let attachmentFactory: AttachmentFactory
  let categoryFactory: CategoryFactory
  let sellerFactory: SellerFactory
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

  test('[GET] /products/:id', async () => {
    const avatar = await attachmentFactory.makePrismaAttachment()

    const [user, category1, attachment1, attachment2] = await Promise.all([
      sellerFactory.makePrismaSeller({
        avatarId: avatar.id,
        name: 'John',
      }),
      categoryFactory.makePrismaCategory({ title: 'category-1' }),
      attachmentFactory.makePrismaAttachment({ url: 'url-1' }),
      attachmentFactory.makePrismaAttachment({ url: 'url-2' }),
    ])

    const product = await productFactory.makePrismaProduct({
      attachments: new ProductAttachmentList([attachment1, attachment2]),
      category: category1,
      owner: user,
      status: ProductStatus.available,
      title: 'Title',
      priceInCents: 5000,
      description: 'Description',
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .get(`/products/${product.id.toString()}`)
      .set('Cookie', [`access-token=${accessToken}`])
      .send()

    expect(response.statusCode).toBe(200)

    expect(response.body.product).toEqual(
      expect.objectContaining({
        title: 'Title',
        priceInCents: 5000,
        description: 'Description',
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
    )
  })
})
