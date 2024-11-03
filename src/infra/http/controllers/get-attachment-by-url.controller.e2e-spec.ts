import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import { readdirSync, unlinkSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Download attachment by URL (E2E)', () => {
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
      if (file.endsWith('-sample-upload2.png')) {
        unlinkSync(resolve(uploadDir, file))
      }
    })
  })

  test('[GET] /attachments/download', async () => {
    const id = randomUUID()

    const sampleBuffer = await readFile(resolve('test/e2e/sample-upload.png'))

    await writeFile(
      resolve('upload-files', `${id}-sample-upload2.png`),
      sampleBuffer,
    )

    const response = await request(app.getHttpServer()).get(
      `/attachments/download?url=${id}-sample-upload2.png`,
    )

    expect(response.statusCode).toBe(200)

    expect(response.headers['content-type']).toBe('image/png')
  })
})
