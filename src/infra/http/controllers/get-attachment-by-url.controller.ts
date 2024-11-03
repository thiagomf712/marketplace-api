import { Controller, Get, Query, Res } from '@nestjs/common'
import { type Response } from 'express'
import { createReadStream } from 'fs'
import * as mime from 'mime-types'
import { resolve } from 'path'
import { z } from 'zod'

import { Public } from '@/infra/auth/public'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const getAttachmentByUrlQuery = z.object({
  url: z.string(),
})

const getAttachmentByUrlPipe = new ZodValidationPipe(getAttachmentByUrlQuery)

type GetAttachmentByUrlQuery = z.infer<typeof getAttachmentByUrlQuery>

@Public()
@Controller('/attachments/download')
export class GetAttachmentByUrlController {
  @Get()
  async handle(
    @Query(getAttachmentByUrlPipe) query: GetAttachmentByUrlQuery,
    @Res() response: Response,
  ) {
    const { url } = query

    try {
      const file = createReadStream(resolve('upload-files', url))

      const mimeType = mime.lookup(url)

      if (mimeType) {
        response.contentType(mimeType)
      }

      file.pipe(response)
    } catch {
      response.status(404).json({ message: 'File not found' })
    }
  }
}
