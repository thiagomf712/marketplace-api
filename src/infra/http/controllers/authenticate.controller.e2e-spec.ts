import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { SellerFactory } from 'test/factories/make-seller'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let sellerFactory: SellerFactory
  let attachmentFactory: AttachmentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    sellerFactory = moduleRef.get(SellerFactory)

    attachmentFactory = moduleRef.get(AttachmentFactory)

    await app.init()
  })

  test('[POST] /sessions', async () => {
    const avatar = await attachmentFactory.makePrismaAttachment()

    await sellerFactory.makePrismaSeller({
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
      avatarId: avatar.id,
    })

    const response = await request(app.getHttpServer())
      .post('/sellers/sessions')
      .send({
        email: 'johndoe@example.com',
        password: '123456',
      })

    expect(response.statusCode).toBe(201)

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    })

    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('access-token=')]),
    )
  })
})
