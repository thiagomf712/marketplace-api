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
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Update Product (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
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

    prisma = moduleRef.get(PrismaService)

    categoryFactory = moduleRef.get(CategoryFactory)

    sellerFactory = moduleRef.get(SellerFactory)

    productFactory = moduleRef.get(ProductFactory)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /products', async () => {
    const avatar = await attachmentFactory.makePrismaAttachment()

    const [user, category1, category2, attachment1, attachment2, attachment3] =
      await Promise.all([
        sellerFactory.makePrismaSeller({
          avatarId: avatar.id,
          name: 'John',
        }),
        categoryFactory.makePrismaCategory({ title: 'category-1' }),
        categoryFactory.makePrismaCategory({ title: 'category-2' }),
        attachmentFactory.makePrismaAttachment({ url: 'url-1' }),
        attachmentFactory.makePrismaAttachment({ url: 'url-2' }),
        attachmentFactory.makePrismaAttachment({ url: 'url-3' }),
      ])

    const product = await productFactory.makePrismaProduct({
      attachments: new ProductAttachmentList([attachment1, attachment2]),
      category: category1,
      owner: user,
      status: ProductStatus.available,
      title: 'Old Title',
      priceInCents: 5000,
      description: 'Old Description',
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .put(`/products/${product.id.toString()}`)
      .set('Cookie', [`access-token=${accessToken}`])
      .send({
        title: 'New Title',
        categoryId: category2.id.toString(),
        description: 'New Description',
        priceInCents: 3000,
        attachmentsIds: [attachment1.id.toString(), attachment3.id.toString()],
      })

    expect(response.statusCode).toBe(200)

    expect(response.body.product).toEqual(
      expect.objectContaining({
        title: 'New Title',
        priceInCents: 3000,
        description: 'New Description',
        category: expect.objectContaining({
          title: 'category-2',
        }),
        attachments: expect.arrayContaining([
          expect.objectContaining({ url: 'url-1' }),
          expect.objectContaining({ url: 'url-3' }),
        ]),
      }),
    )

    const productOnDatabase = await prisma.product.findFirst({
      where: {
        id: product.id.toString(),
      },
      include: {
        attachments: true,
      },
    })

    expect(productOnDatabase).toBeTruthy()

    expect(productOnDatabase).toEqual(
      expect.objectContaining({
        title: 'New Title',
        priceInCents: 3000,
        description: 'New Description',
        categoryId: category2.id.toString(),
        attachments: expect.arrayContaining([
          expect.objectContaining({ url: 'url-1' }),
          expect.objectContaining({ url: 'url-3' }),
        ]),
      }),
    )
  })
})
