import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateCampaignDto {
  @ApiProperty({ description: 'Campaign name', example: 'Updated Campaign Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Campaign description', example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Campaign start date', example: '2025-12-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Campaign end date', example: '2025-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
