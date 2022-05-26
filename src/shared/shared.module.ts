import { Module } from '@nestjs/common';

import { GoogoleaApisService } from './services/google-apis.service';

const providers = [GoogoleaApisService];

@Module({
  providers,
  exports: [...providers],
})
export class SharedModule {}
