import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { Attachment } from '../../enterprise/entities/attachment'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { Uploader } from '../storage/uploader'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'

interface UploadAttachmentsRequest {
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAttachmentsResponse = Either<
  InvalidAttachmentTypeError,
  { attachment: Attachment }
>

@Injectable()
export class UploadAttachmentUseCase {
  constructor(
    private attachmentsRepository: AttachmentsRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    fileName,
    body,
    fileType,
  }: UploadAttachmentsRequest): Promise<UploadAttachmentsResponse> {
    if (!/^(image\/(jpeg|png))$/.test(fileType)) {
      return left(new InvalidAttachmentTypeError(fileType))
    }

    const { url } = await this.uploader.upload({ fileName, fileType, body })

    const attachment = Attachment.create({
      url,
    })

    await this.attachmentsRepository.create(attachment)

    return right({
      attachment,
    })
  }
}
