import { Module } from '@nestjs/common'

import { EnvModule } from '../env/env.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { SignOutController } from './controllers/sign-out.controller'

@Module({
  imports: [EnvModule],
  controllers: [AuthenticateController, SignOutController],
})
export class HttpModule {}
