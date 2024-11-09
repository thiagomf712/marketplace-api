import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'

import { InvalidAttachmentTypeError } from '@/domain/marketplace/application/use-cases/errors/invalid-attachment-type-error'
import { UploadAttachmentUseCase } from '@/domain/marketplace/application/use-cases/upload-attachments'
import { Public } from '@/infra/auth/public'

import { AttachmentPresenter } from '../presenters/attachment-presenter'

@Public()
@Controller('/attachments')
export class UploadAttachmentController {
  constructor(private uploadAttachmentUseCase: UploadAttachmentUseCase) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async handle(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, // 2mb
          }),
          new FileTypeValidator({
            fileType: '.(png|jpg|jpeg)',
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    const result = await this.uploadAttachmentUseCase.execute({
      attachments: files.map((file) => ({
        fileName: file.originalname,
        fileType: file.mimetype,
        body: file.buffer,
      })),
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case InvalidAttachmentTypeError:
          throw new BadRequestException(error.message)

        default:
          throw new BadRequestException(error.message)
      }
    }

    const { attachments } = result.value

    return {
      attachments: attachments.map(AttachmentPresenter.toHTTP),
    }
  }
}
