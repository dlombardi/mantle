import { Module, Global } from '@nestjs/common';
import { TriggerService } from './trigger.service';

@Global()
@Module({
  providers: [TriggerService],
  exports: [TriggerService],
})
export class TriggerModule {}
