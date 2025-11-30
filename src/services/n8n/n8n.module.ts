import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { N8nApiService } from './n8n-api.service';
import { N8nConverterService } from './n8n-converter.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [N8nApiService, N8nConverterService],
  exports: [N8nApiService, N8nConverterService],
})
export class N8nModule {}
