import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { CategoryFactory } from 'test/factories/make-category'
import { SellerFactory } from 'test/factories/make-seller'

import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Create Product (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let attachmentFactory: AttachmentFactory
  let categoryFactory: CategoryFactory
  let sellerFactory: SellerFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, AttachmentFactory, CategoryFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    app.use(cookieParser())

    attachmentFactory = moduleRef.get(AttachmentFactory)

    prisma = moduleRef.get(PrismaService)

    categoryFactory = moduleRef.get(CategoryFactory)

    sellerFactory = moduleRef.get(SellerFactory)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /products', async () => {
    const avatar = await attachmentFactory.makePrismaAttachment()

    const [user, category, attachment1, attachment2] = await Promise.all([
      sellerFactory.makePrismaSeller({
        avatarId: avatar.id,
        name: 'John',
      }),
      categoryFactory.makePrismaCategory({ title: 'category-1' }),
      attachmentFactory.makePrismaAttachment({ url: 'url-1' }),
      attachmentFactory.makePrismaAttachment({ url: 'url-2' }),
    ])

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Cookie', [`access-token=${accessToken}`])
      .send({
        title: 'Product',
        categoryId: category.id.toString(),
        description: 'Product description',
        priceInCents: 5000,
        attachmentsIds: [attachment1.id.toString(), attachment2.id.toString()],
      })

    expect(response.statusCode).toBe(201)

    expect(response.body.product).toEqual(
      expect.objectContaining({
        title: 'Product',
        status: ProductStatus.available,
        owner: expect.objectContaining({
          name: 'John',
        }),
        category: expect.objectContaining({
          title: 'category-1',
        }),
        attachments: expect.arrayContaining([
          expect.objectContaining({ url: 'url-1' }),
          expect.objectContaining({ url: 'url-2' }),
        ]),
      }),
    )

    const productOnDatabase = await prisma.product.findFirst({
      where: {
        title: 'Product',
      },
    })

    expect(productOnDatabase).toBeTruthy()
  })
})
