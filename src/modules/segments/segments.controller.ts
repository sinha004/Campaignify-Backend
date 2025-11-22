import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SegmentsService } from './segments.service';
import { UploadSegmentDto } from './dto/upload-segment.dto';

@ApiTags('Customer Segments')
@ApiBearerAuth('JWT-auth')
@Controller('segments')
@UseGuards(JwtAuthGuard)
export class SegmentsController {
  constructor(private segmentsService: SegmentsService) {}

  /**
   * Upload a new segment CSV file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a customer segment CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file containing customer data',
        },
        name: {
          type: 'string',
          description: 'Optional segment name',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Segment uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid JWT token' })
  async uploadSegment(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadSegmentDto: UploadSegmentDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.userId;
    const segment = await this.segmentsService.uploadSegment(
      userId,
      file,
      uploadSegmentDto.name,
    );

    return {
      success: true,
      message: 'Segment uploaded successfully',
      data: {
        id: segment.id,
        name: segment.name,
        fileName: segment.fileName,
        fileSize: segment.fileSize,
        totalRecords: segment.totalRecords,
        uploadedAt: segment.uploadedAt,
      },
    };
  }

  /**
   * Get all segments for the authenticated user
   */
  @Get()
  @ApiOperation({ summary: 'Get all segments for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Returns list of user segments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllSegments(@Request() req: any) {
    const userId = req.user.userId;
    const segments = await this.segmentsService.findAllByUser(userId);

    return {
      success: true,
      data: segments.map((segment) => ({
        id: segment.id,
        name: segment.name,
        fileName: segment.fileName,
        fileSize: segment.fileSize,
        totalRecords: segment.totalRecords,
        uploadedAt: segment.uploadedAt,
        status: segment.status,
      })),
    };
  }

  /**
   * Get a single segment by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get segment details by ID' })
  @ApiResponse({ status: 200, description: 'Returns segment details' })
  @ApiResponse({ status: 404, description: 'Segment not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this segment' })
  async getSegment(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    const segment = await this.segmentsService.findOne(id, userId);

    return {
      success: true,
      data: segment,
    };
  }

  /**
   * Get download URL for a segment
   */
  @Get(':id/download')
  @ApiOperation({ summary: 'Generate presigned S3 URL to download segment CSV' })
  @ApiResponse({ status: 200, description: 'Returns presigned download URL (valid for 1 hour)' })
  @ApiResponse({ status: 404, description: 'Segment not found' })
  async getDownloadUrl(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    const downloadUrl = await this.segmentsService.getDownloadUrl(id, userId);

    return {
      success: true,
      data: { downloadUrl },
    };
  }

  /**
   * Delete a segment
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a segment (soft delete in DB, removes from S3)' })
  @ApiResponse({ status: 200, description: 'Segment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Segment not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async deleteSegment(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    const result = await this.segmentsService.deleteSegment(id, userId);

    return {
      success: true,
      message: result.message,
    };
  }
}
