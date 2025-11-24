import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ 
    description: 'New campaign status', 
    example: 'running',
    enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'failed']
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['draft', 'scheduled', 'running', 'paused', 'completed', 'failed'])
  status: string;
}
