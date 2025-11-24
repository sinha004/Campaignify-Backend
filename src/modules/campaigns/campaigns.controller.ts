import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { SaveFlowDto } from './dto/save-flow.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';

@ApiTags('Campaigns')
@ApiBearerAuth('JWT-auth')
@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Segment not found' })
  async create(@Request() req: any, @Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(req.user.userId, createCampaignDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns retrieved successfully',
    type: [CampaignResponseDto],
  })
  async findAll(@Request() req: any) {
    return this.campaignsService.findAll(req.user.userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get campaign statistics for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Campaign statistics retrieved successfully',
  })
  async getStatistics(@Request() req: any) {
    return this.campaignsService.getStatistics(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign updated successfully',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or campaign status' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, req.user.userId, updateCampaignDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update campaign status' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign status updated successfully',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.campaignsService.updateStatus(id, req.user.userId, updateStatusDto.status);
  }

  @Post(':id/flow')
  @ApiOperation({ summary: 'Save flow builder data for a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Flow data saved successfully',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async saveFlow(
    @Param('id') id: string,
    @Request() req: any,
    @Body() saveFlowDto: SaveFlowDto,
  ) {
    return this.campaignsService.saveFlow(id, req.user.userId, saveFlowDto);
  }

  @Get(':id/flow')
  @ApiOperation({ summary: 'Get flow builder data for a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Flow data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getFlow(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.getFlow(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete running campaign' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.delete(id, req.user.userId);
  }
}
