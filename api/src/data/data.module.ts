import { Module } from '@nestjs/common';
import { DataService } from './data.service';

/**
 * Carrega os dados na subida. Para usar o DataService num módulo seu,
 * coloque `DataModule` nos `imports` desse módulo.
 */
@Module({
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
