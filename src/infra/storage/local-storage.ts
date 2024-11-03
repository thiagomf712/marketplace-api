import { randomUUID } from 'node:crypto'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { Injectable } from '@nestjs/common'

import {
  Uploader,
  UploadParams,
} from '@/domain/marketplace/application/storage/uploader'

@Injectable()
export class LocalStorage implements Uploader {
  async upload({ fileName, body }: UploadParams): Promise<{ url: string }> {
    const uploadId = randomUUID()

    const uniqueFileName = `${uploadId}-${fileName}`

    const folderPath = path.resolve('upload-files')

    const filePath = path.resolve(folderPath, uniqueFileName)

    try {
      await fs.access(folderPath)
    } catch {
      await fs.mkdir(folderPath)
    }

    await fs.writeFile(filePath, body)

    return {
      url: uniqueFileName,
    }
  }
}
