import { Module } from '@nestjs/common'

import { Uploader } from '@/domain/marketplace/application/storage/uploader'

import { EnvModule } from '../env/env.module'
import { LocalStorage } from './local-storage'

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Uploader,
      useClass: LocalStorage,
    },
  ],
  exports: [Uploader],
})
export class StorageModule {}
