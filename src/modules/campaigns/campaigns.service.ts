import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { SaveFlowDto } from './dto/save-flow.dto';

@Injectable()
export class CampaignsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(userId: number, createCampaignDto: CreateCampaignDto) {
    const { segmentId, name, description, startDate, endDate } = createCampaignDto;

    // Verify segment exists and belongs to user
    const segment = await this.prisma.segment.findUnique({
      where: { id: segmentId },
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    if (segment.userId !== userId) {
      throw new ForbiddenException('You do not have access to this segment');
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }

    // Create campaign
    const campaign = await this.prisma.campaign.create({
      data: {
        userId,
        segmentId,
        name,
        description,
        startDate: start,
        endDate: end,
        totalUsersTargeted: segment.totalRecords,
      },
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            totalRecords: true,
          },
        },
      },
    });

    return campaign;
  }

  async findAll(userId: number) {
    const campaigns = await this.prisma.campaign.findMany({
      where: { userId },
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            totalRecords: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return campaigns;
  }

  async findOne(id: string, userId: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            totalRecords: true,
            fileName: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.userId !== userId) {
      throw new ForbiddenException('You do not have access to this campaign');
    }

    return campaign;
  }

  async update(id: string, userId: number, updateCampaignDto: UpdateCampaignDto) {
    const campaign = await this.findOne(id, userId);

    // Prevent updates if campaign is running or completed
    if (['running', 'completed', 'failed'].includes(campaign.status)) {
      throw new BadRequestException(`Cannot update campaign in ${campaign.status} status`);
    }

    const updateData: any = {};

    if (updateCampaignDto.name) {
      updateData.name = updateCampaignDto.name;
    }

    if (updateCampaignDto.description !== undefined) {
      updateData.description = updateCampaignDto.description;
    }

    if (updateCampaignDto.startDate) {
      updateData.startDate = new Date(updateCampaignDto.startDate);
    }

    if (updateCampaignDto.endDate) {
      updateData.endDate = new Date(updateCampaignDto.endDate);
    }

    // Validate dates if both are provided
    if (updateData.startDate || updateData.endDate) {
      const start = updateData.startDate || campaign.startDate;
      const end = updateData.endDate || campaign.endDate;

      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            totalRecords: true,
          },
        },
      },
    });

    return updatedCampaign;
  }

  async updateStatus(id: string, userId: number, status: string) {
    const campaign = await this.findOne(id, userId);

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      draft: ['scheduled'],
      scheduled: ['running', 'draft'],
      running: ['paused', 'completed', 'failed'],
      paused: ['running', 'failed'],
      completed: [],
      failed: ['draft'],
    };

    if (!validTransitions[campaign.status].includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${campaign.status} to ${status}`,
      );
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: { status },
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            totalRecords: true,
          },
        },
      },
    });

    return updatedCampaign;
  }

  async saveFlow(id: string, userId: number, saveFlowDto: SaveFlowDto) {
    const campaign = await this.findOne(id, userId);

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        flowData: saveFlowDto.flowData,
      },
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            totalRecords: true,
          },
        },
      },
    });

    return updatedCampaign;
  }

  async getFlow(id: string, userId: number) {
    const campaign = await this.findOne(id, userId);
    
    return {
      flowData: campaign.flowData || { nodes: [], edges: [] },
    };
  }

  async delete(id: string, userId: number) {
    const campaign = await this.findOne(id, userId);

    // Prevent deletion if campaign is running
    if (campaign.status === 'running') {
      throw new BadRequestException('Cannot delete a running campaign');
    }

    await this.prisma.campaign.delete({
      where: { id },
    });

    return { message: 'Campaign deleted successfully' };
  }

  async getStatistics(userId: number) {
    const campaigns = await this.prisma.campaign.findMany({
      where: { userId },
    });

    const stats = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: any) => c.status === 'running').length,
      scheduledCampaigns: campaigns.filter((c: any) => c.status === 'scheduled').length,
      completedCampaigns: campaigns.filter((c: any) => c.status === 'completed').length,
      totalSent: campaigns.reduce((sum: number, c: any) => sum + c.totalSent, 0),
      totalFailed: campaigns.reduce((sum: number, c: any) => sum + c.totalFailed, 0),
      totalUsersTargeted: campaigns.reduce((sum: number, c: any) => sum + c.totalUsersTargeted, 0),
    };

    return stats;
  }
}
