import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { Attachment } from '../../enterprise/entities/attachment'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { Uploader } from '../storage/uploader'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'

interface UploadAttachmentBody {
  fileName: string
  fileType: string
  body: Buffer
}

interface UploadAttachmentsRequest {
  attachments: UploadAttachmentBody[]
}

type UploadAttachmentsResponse = Either<
  InvalidAttachmentTypeError,
  { attachments: Attachment[] }
>

type SaveAttachmentResponse = Either<InvalidAttachmentTypeError, Attachment>

@Injectable()
export class UploadAttachmentUseCase {
  constructor(
    private attachmentsRepository: AttachmentsRepository,
    private uploader: Uploader,
  ) {}

  async saveAttachment({
    body,
    fileName,
    fileType,
  }: UploadAttachmentBody): Promise<SaveAttachmentResponse> {
    if (!/^(image\/(jpeg|png))$/.test(fileType)) {
      return left(new InvalidAttachmentTypeError(fileType))
    }

    const { url } = await this.uploader.upload({ fileName, fileType, body })

    const attachment = Attachment.create({
      url,
    })

    await this.attachmentsRepository.create(attachment)

    return right(attachment)
  }

  async execute({
    attachments,
  }: UploadAttachmentsRequest): Promise<UploadAttachmentsResponse> {
    // should add an transaction here
    const attachmentsResult = await Promise.all(
      attachments.map((attachment) => this.saveAttachment(attachment)),
    )

    const invalidAttachment = attachmentsResult.find((result) =>
      result.isLeft(),
    )

    if (invalidAttachment) {
      return left(invalidAttachment.value)
    }

    return right({
      attachments: attachmentsResult.map(
        (result) => result.value as Attachment,
      ),
    })
  }
}
