import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { SellerFactory } from 'test/factories/make-seller'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let sellerFactory: SellerFactory
  let attachmentFactory: AttachmentFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    app.use(cookieParser())

    sellerFactory = moduleRef.get(SellerFactory)

    attachmentFactory = moduleRef.get(AttachmentFactory)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /sign-out', async () => {
    const avatar = await attachmentFactory.makePrismaAttachment()

    const user = await sellerFactory.makePrismaSeller({
      avatarId: avatar.id,
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .post('/sign-out')
      .set('Cookie', [`access-token=${accessToken}`])
      .send()

    expect(response.statusCode).toBe(200)

    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('access-token=;')]),
    )
  })
})
