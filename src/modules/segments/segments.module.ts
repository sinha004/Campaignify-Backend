import { Module } from '@nestjs/common';
import { SegmentsController } from './segments.controller';
import { SegmentsService } from './segments.service';
import { S3Service } from '../../services/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [SegmentsController],
  providers: [SegmentsService, S3Service],
  exports: [SegmentsService],
})
export class SegmentsModule {}
