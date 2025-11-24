"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let CampaignsService = class CampaignsService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async create(userId, createCampaignDto) {
        const { segmentId, name, description, startDate, endDate } = createCampaignDto;
        // Verify segment exists and belongs to user
        const segment = await this.prisma.segment.findUnique({
            where: { id: segmentId },
        });
        if (!segment) {
            throw new common_1.NotFoundException('Segment not found');
        }
        if (segment.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this segment');
        }
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            throw new common_1.BadRequestException('End date must be after start date');
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
    async findAll(userId) {
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
    async findOne(id, userId) {
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
            throw new common_1.NotFoundException('Campaign not found');
        }
        if (campaign.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this campaign');
        }
        return campaign;
    }
    async update(id, userId, updateCampaignDto) {
        const campaign = await this.findOne(id, userId);
        // Prevent updates if campaign is running or completed
        if (['running', 'completed', 'failed'].includes(campaign.status)) {
            throw new common_1.BadRequestException(`Cannot update campaign in ${campaign.status} status`);
        }
        const updateData = {};
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
                throw new common_1.BadRequestException('End date must be after start date');
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
    async updateStatus(id, userId, status) {
        const campaign = await this.findOne(id, userId);
        // Validate status transitions
        const validTransitions = {
            draft: ['scheduled'],
            scheduled: ['running', 'draft'],
            running: ['paused', 'completed', 'failed'],
            paused: ['running', 'failed'],
            completed: [],
            failed: ['draft'],
        };
        if (!validTransitions[campaign.status].includes(status)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${campaign.status} to ${status}`);
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
    async saveFlow(id, userId, saveFlowDto) {
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
    async getFlow(id, userId) {
        const campaign = await this.findOne(id, userId);
        return {
            flowData: campaign.flowData || { nodes: [], edges: [] },
        };
    }
    async delete(id, userId) {
        const campaign = await this.findOne(id, userId);
        // Prevent deletion if campaign is running
        if (campaign.status === 'running') {
            throw new common_1.BadRequestException('Cannot delete a running campaign');
        }
        await this.prisma.campaign.delete({
            where: { id },
        });
        return { message: 'Campaign deleted successfully' };
    }
    async getStatistics(userId) {
        const campaigns = await this.prisma.campaign.findMany({
            where: { userId },
        });
        const stats = {
            totalCampaigns: campaigns.length,
            activeCampaigns: campaigns.filter((c) => c.status === 'running').length,
            scheduledCampaigns: campaigns.filter((c) => c.status === 'scheduled').length,
            completedCampaigns: campaigns.filter((c) => c.status === 'completed').length,
            totalSent: campaigns.reduce((sum, c) => sum + c.totalSent, 0),
            totalFailed: campaigns.reduce((sum, c) => sum + c.totalFailed, 0),
            totalUsersTargeted: campaigns.reduce((sum, c) => sum + c.totalUsersTargeted, 0),
        };
        return stats;
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CampaignsService);
