import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadSegmentDto {
  @ApiPropertyOptional({
    example: 'Tech Startup Founders',
    description: 'Custom name for the segment (defaults to filename if not provided)',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
