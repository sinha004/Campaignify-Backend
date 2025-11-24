import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class SaveFlowDto {
  @ApiProperty({ 
    description: 'React Flow data structure',
    example: { nodes: [], edges: [] }
  })
  @IsNotEmpty()
  @IsObject()
  flowData: any;
}
