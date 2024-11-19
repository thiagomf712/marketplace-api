import { Attachment } from '../../enterprise/entities/attachment'

export abstract class AttachmentsRepository {
  abstract findManyByIds(ids: string[]): Promise<Attachment[]>

  abstract findById(id: string): Promise<Attachment | null>

  abstract create(attachment: Attachment): Promise<void>
}
