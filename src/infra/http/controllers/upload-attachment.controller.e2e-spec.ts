import { readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Upload attachment (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    const uploadDir = resolve('upload-files')
    const files = readdirSync(uploadDir)

    files.forEach((file) => {
      if (file.endsWith('-sample-upload.png')) {
        unlinkSync(resolve(uploadDir, file))
      }
    })
  })

  test('[POST] /attachments', async () => {
    const response = await request(app.getHttpServer())
      .post('/attachments')
      .attach('files', './test/e2e/sample-upload.png')
      .attach('files', './test/e2e/sample-upload.png')

    expect(response.statusCode).toBe(201)

    expect(response.body).toEqual({
      attachments: expect.arrayContaining([
        {
          id: expect.any(String),
          url: expect.stringContaining('-sample-upload.png'),
        },
        {
          id: expect.any(String),
          url: expect.stringContaining('-sample-upload.png'),
        },
      ]),
    })
  })
})
