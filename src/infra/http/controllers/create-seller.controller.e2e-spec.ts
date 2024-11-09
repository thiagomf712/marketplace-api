import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachment'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Create Seller (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let attachmentFactory: AttachmentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    attachmentFactory = moduleRef.get(AttachmentFactory)

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /sellers', async () => {
    const attachment = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer()).post('/sellers').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '123456789',
      password: '123456',
      passwordConfirmation: '123456',
      avatarId: attachment.id.toString(),
    })

    expect(response.statusCode).toBe(201)

    expect(response.body.seller).toEqual(
      expect.objectContaining({
        name: 'John Doe',
      }),
    )

    const sellerOnDatabase = await prisma.user.findUnique({
      where: {
        email: 'johndoe@example.com',
      },
    })

    expect(sellerOnDatabase).toBeTruthy()
  })
})
