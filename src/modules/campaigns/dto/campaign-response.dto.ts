import { ApiProperty } from '@nestjs/swagger';

export class CampaignResponseDto {
  @ApiProperty({ description: 'Campaign ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'User ID who created the campaign', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Segment ID being targeted', example: '123e4567-e89b-12d3-a456-426614174000' })
  segmentId: string;

  @ApiProperty({ description: 'Campaign name', example: 'Summer Sale Campaign' })
  name: string;

  @ApiProperty({ description: 'Campaign description', example: 'Promotional campaign for summer products', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Campaign start date', example: '2025-12-01T00:00:00Z' })
  startDate: Date;

  @ApiProperty({ description: 'Campaign end date', example: '2025-12-31T23:59:59Z' })
  endDate: Date;

  @ApiProperty({ description: 'Campaign status', example: 'draft', enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'failed'] })
  status: string;

  @ApiProperty({ description: 'Total users targeted', example: 1500 })
  totalUsersTargeted: number;

  @ApiProperty({ description: 'Total jobs created', example: 1500 })
  totalJobsCreated: number;

  @ApiProperty({ description: 'Total messages sent', example: 1200 })
  totalSent: number;

  @ApiProperty({ description: 'Total failed messages', example: 50 })
  totalFailed: number;

  @ApiProperty({ description: 'Flow builder data (React Flow JSON)', nullable: true })
  flowData?: any;

  @ApiProperty({ description: 'Campaign creation timestamp', example: '2025-11-22T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Campaign last update timestamp', example: '2025-11-22T15:30:00Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Segment details', required: false })
  segment?: {
    id: string;
    name: string;
    totalRecords: number;
  };
}
