import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { CategoryFactory } from 'test/factories/make-category'
import { SellerFactory } from 'test/factories/make-seller'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let sellerFactory: SellerFactory
  let attachmentFactory: AttachmentFactory
  let categoryFactory: CategoryFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, AttachmentFactory, CategoryFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    app.use(cookieParser())

    sellerFactory = moduleRef.get(SellerFactory)

    attachmentFactory = moduleRef.get(AttachmentFactory)

    categoryFactory = moduleRef.get(CategoryFactory)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /categories', async () => {
    const avatar = await attachmentFactory.makePrismaAttachment()

    const [user] = await Promise.all([
      sellerFactory.makePrismaSeller({
        avatarId: avatar.id,
      }),
      categoryFactory.makePrismaCategory({ title: 'Category 1' }),
      categoryFactory.makePrismaCategory({ title: 'Category 2' }),
      categoryFactory.makePrismaCategory({ title: 'Category 3' }),
    ])

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .get('/categories')
      .set('Cookie', [`access-token=${accessToken}`])
      .send()

    expect(response.statusCode).toBe(200)

    expect(response.body.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Category 1', slug: 'category-1' }),
        expect.objectContaining({ title: 'Category 2', slug: 'category-2' }),
        expect.objectContaining({ title: 'Category 3', slug: 'category-3' }),
      ]),
    )
  })
})
