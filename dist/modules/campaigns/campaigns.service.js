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
var CampaignsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const cache_service_1 = require("../../cache/cache.service");
const n8n_api_service_1 = require("../../services/n8n/n8n-api.service");
const n8n_converter_service_1 = require("../../services/n8n/n8n-converter.service");
let CampaignsService = CampaignsService_1 = class CampaignsService {
    constructor(cacheService, n8nApiService, n8nConverterService) {
        this.cacheService = cacheService;
        this.n8nApiService = n8nApiService;
        this.n8nConverterService = n8nConverterService;
        this.logger = new common_1.Logger(CampaignsService_1.name);
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
        // Invalidate campaigns cache
        await this.cacheService.invalidateUserResource(userId, 'campaigns');
        await this.cacheService.del(this.cacheService.getUserKey(userId, 'campaign', 'stats'));
        return campaign;
    }
    async findAll(userId) {
        const cacheKey = this.cacheService.getUserKey(userId, 'campaigns');
        return this.cacheService.wrap(cacheKey, async () => {
            return this.prisma.campaign.findMany({
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
        }, 300);
    }
    async findOne(id, userId) {
        const cacheKey = this.cacheService.getResourceKey('campaign', id);
        return this.cacheService.wrap(cacheKey, async () => {
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
        }, 600);
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
        // Invalidate cache
        await this.cacheService.del(this.cacheService.getResourceKey('campaign', id));
        await this.cacheService.invalidateUserResource(userId, 'campaigns');
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
        // If transitioning to running, check if workflow is deployed
        if (status === 'running' && campaign.n8nWorkflowId) {
            try {
                // Activate the workflow in n8n
                await this.n8nApiService.activateWorkflow(campaign.n8nWorkflowId);
                this.logger.log(`Activated n8n workflow for campaign: ${id}`);
            }
            catch (error) {
                this.logger.warn(`Failed to activate n8n workflow: ${error.message}`);
                // Continue with status update even if activation fails
            }
        }
        // If transitioning away from running, deactivate workflow
        if (campaign.status === 'running' && status !== 'running' && campaign.n8nWorkflowId) {
            try {
                await this.n8nApiService.deactivateWorkflow(campaign.n8nWorkflowId);
                this.logger.log(`Deactivated n8n workflow for campaign: ${id}`);
            }
            catch (error) {
                this.logger.warn(`Failed to deactivate n8n workflow: ${error.message}`);
            }
        }
        const updatedCampaign = await this.prisma.campaign.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign({ status }, (status === 'running' && { executionStatus: 'active' })), (status === 'completed' && { executionStatus: 'completed' })), (status === 'failed' && { executionStatus: 'failed' })), (status === 'paused' && { executionStatus: 'paused' })),
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
        // Invalidate cache
        await this.cacheService.del(this.cacheService.getResourceKey('campaign', id));
        await this.cacheService.invalidateUserResource(userId, 'campaigns');
        await this.cacheService.del(this.cacheService.getUserKey(userId, 'campaign', 'stats'));
        return updatedCampaign;
    }
    async saveFlow(id, userId, saveFlowDto) {
        const campaign = await this.findOne(id, userId);
        const updatedCampaign = await this.prisma.campaign.update({
            where: { id },
            data: {
                flowData: saveFlowDto.flowData,
                flowUpdatedAt: new Date(),
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
        // Invalidate campaign and flow cache
        await this.cacheService.del(this.cacheService.getResourceKey('campaign', id));
        await this.cacheService.del(this.cacheService.getResourceKey('campaign-flow', id));
        return updatedCampaign;
    }
    async getFlow(id, userId) {
        const cacheKey = this.cacheService.getResourceKey('campaign-flow', id);
        return this.cacheService.wrap(cacheKey, async () => {
            const campaign = await this.findOne(id, userId);
            return {
                flowData: campaign.flowData || { nodes: [], edges: [] },
            };
        }, 600);
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
        // Invalidate all related cache
        await this.cacheService.del(this.cacheService.getResourceKey('campaign', id));
        await this.cacheService.del(this.cacheService.getResourceKey('campaign-flow', id));
        await this.cacheService.del(this.cacheService.getResourceKey('workflow-status', id));
        await this.cacheService.invalidateUserResource(userId, 'campaigns');
        await this.cacheService.del(this.cacheService.getUserKey(userId, 'campaign', 'stats'));
        return { message: 'Campaign deleted successfully' };
    }
    async getStatistics(userId) {
        const cacheKey = this.cacheService.getUserKey(userId, 'campaign', 'stats');
        return this.cacheService.wrap(cacheKey, async () => {
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
        }, 120);
    }
    /**
     * Deploy flow to n8n
     */
    async deployFlow(id, userId) {
        var _a;
        const campaign = await this.findOne(id, userId);
        if (!campaign.flowData) {
            throw new common_1.BadRequestException('No flow data to deploy. Please create a flow first.');
        }
        const flowData = campaign.flowData;
        // Validate flow data
        const validation = this.n8nConverterService.validateFlowData(flowData);
        if (!validation.valid) {
            throw new common_1.BadRequestException(`Flow validation failed: ${validation.errors.join(', ')}`);
        }
        // Convert to n8n workflow format
        const n8nWorkflow = this.n8nConverterService.convertToN8nWorkflow(flowData, campaign.name, campaign.id);
        try {
            let workflowResult;
            // Check if workflow already exists in n8n
            if (campaign.n8nWorkflowId) {
                // Try to get the existing workflow first
                const existingWorkflow = await this.n8nApiService.getWorkflow(campaign.n8nWorkflowId);
                if (existingWorkflow) {
                    // Update existing workflow
                    this.logger.log(`Updating existing n8n workflow: ${campaign.n8nWorkflowId}`);
                    workflowResult = await this.n8nApiService.updateWorkflow(campaign.n8nWorkflowId, n8nWorkflow);
                }
                else {
                    // Workflow was deleted from n8n, create a new one
                    this.logger.log(`Workflow ${campaign.n8nWorkflowId} not found in n8n, creating new one`);
                    workflowResult = await this.n8nApiService.createWorkflow(n8nWorkflow);
                }
            }
            else {
                // Create new workflow
                this.logger.log(`Creating new n8n workflow for campaign: ${campaign.id}`);
                workflowResult = await this.n8nApiService.createWorkflow(n8nWorkflow);
            }
            // Activate the workflow so webhook is registered
            try {
                await this.n8nApiService.activateWorkflow(workflowResult.id);
                this.logger.log(`Workflow ${workflowResult.id} activated successfully`);
            }
            catch (activateError) {
                this.logger.error(`Failed to activate workflow: ${activateError.message}`);
                // Don't throw - workflow is created but not activated
                // User can manually activate in n8n or we return the test webhook URL
            }
            // Get both production and test webhook URLs
            const webhookPath = `campaign-${campaign.id}`;
            const webhookUrl = this.n8nApiService.getWebhookUrl(webhookPath);
            const testWebhookUrl = webhookUrl.replace('/webhook/', '/webhook-test/');
            // Update campaign with n8n workflow info
            const updatedCampaign = await this.prisma.campaign.update({
                where: { id },
                data: {
                    n8nWorkflowId: workflowResult.id,
                    n8nWorkflowUrl: `${(_a = process.env.N8N_API_URL) === null || _a === void 0 ? void 0 : _a.replace('/api/v1', '')}/workflow/${workflowResult.id}`,
                    flowVersion: { increment: 1 },
                    flowUpdatedAt: new Date(),
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
            // Invalidate cache (including flow and workflow status)
            await this.cacheService.del(this.cacheService.getResourceKey('campaign', id));
            await this.cacheService.del(this.cacheService.getResourceKey('campaign-flow', id));
            await this.cacheService.del(this.cacheService.getResourceKey('workflow-status', id));
            this.logger.log(`Flow deployed. Workflow ID: ${workflowResult.id}`);
            return {
                message: 'Flow deployed successfully',
                n8nWorkflowId: workflowResult.id,
                n8nWorkflowUrl: updatedCampaign.n8nWorkflowUrl,
                webhookUrl: webhookUrl,
                testWebhookUrl: testWebhookUrl,
                campaign: updatedCampaign,
            };
        }
        catch (error) {
            this.logger.error(`Failed to deploy flow: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to deploy flow to n8n: ${error.message}`);
        }
    }
    /**
     * Trigger campaign workflow execution via webhook
     */
    async triggerWorkflow(id, userId) {
        const campaign = await this.findOne(id, userId);
        if (!campaign.n8nWorkflowId) {
            throw new common_1.BadRequestException('Campaign does not have a deployed workflow. Please deploy the flow first.');
        }
        try {
            const webhookPath = `campaign-${campaign.id}`;
            // Try production webhook first, then fall back to test webhook
            let result;
            try {
                this.logger.log(`Triggering workflow via production webhook: ${webhookPath}`);
                result = await this.n8nApiService.executeWorkflowViaWebhook(webhookPath, {
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    segmentId: campaign.segmentId,
                    triggeredAt: new Date().toISOString(),
                });
            }
            catch (prodError) {
                // If production webhook fails, try test webhook
                this.logger.log(`Production webhook failed, trying test webhook: ${webhookPath}`);
                result = await this.n8nApiService.executeWorkflowViaTestWebhook(webhookPath, {
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    segmentId: campaign.segmentId,
                    triggeredAt: new Date().toISOString(),
                });
            }
            // Update campaign execution info
            const updatedCampaign = await this.prisma.campaign.update({
                where: { id },
                data: {
                    executionCount: { increment: 1 },
                    lastExecutedAt: new Date(),
                    executionStatus: 'running',
                },
            });
            // Invalidate cache (including workflow status since execution count changed)
            await this.cacheService.del(this.cacheService.getResourceKey('campaign', id));
            await this.cacheService.del(this.cacheService.getResourceKey('workflow-status', id));
            this.logger.log(`Workflow triggered for campaign: ${campaign.id}`);
            return {
                message: 'Workflow triggered successfully',
                executionData: result,
                campaign: updatedCampaign,
            };
        }
        catch (error) {
            this.logger.error(`Failed to trigger workflow: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to trigger workflow: ${error.message}`);
        }
    }
    /**
     * Get n8n workflow status
     */
    async getWorkflowStatus(id, userId) {
        const campaign = await this.findOne(id, userId);
        if (!campaign.n8nWorkflowId) {
            return {
                isDeployed: false,
                message: 'No workflow deployed',
                n8nWorkflowId: null,
                executions: [],
            };
        }
        // Cache workflow status for 30 seconds (short TTL since executions change frequently)
        const cacheKey = this.cacheService.getResourceKey('workflow-status', id);
        const n8nWorkflowId = campaign.n8nWorkflowId; // We've already checked this is not null above
        return this.cacheService.wrap(cacheKey, async () => {
            try {
                const workflow = await this.n8nApiService.getWorkflow(n8nWorkflowId);
                const executions = await this.n8nApiService.getWorkflowExecutions(n8nWorkflowId, { limit: 10 });
                return {
                    isDeployed: true,
                    n8nWorkflowId: campaign.n8nWorkflowId,
                    workflowUrl: campaign.n8nWorkflowUrl,
                    workflowActive: (workflow === null || workflow === void 0 ? void 0 : workflow.active) || false,
                    flowVersion: campaign.flowVersion,
                    lastDeployedAt: campaign.flowUpdatedAt,
                    executionCount: campaign.executionCount,
                    lastExecutedAt: campaign.lastExecutedAt,
                    executionStatus: campaign.executionStatus,
                    executions: executions.map((e) => ({
                        id: e.id,
                        status: e.status,
                        finished: e.finished,
                        startedAt: e.startedAt,
                        stoppedAt: e.stoppedAt,
                        mode: e.mode,
                    })),
                };
            }
            catch (error) {
                this.logger.error(`Failed to get workflow status: ${error.message}`);
                return {
                    isDeployed: true,
                    n8nWorkflowId: campaign.n8nWorkflowId,
                    executions: [],
                    error: 'Failed to fetch workflow details from n8n',
                };
            }
        }, 30);
    }
    /**
     * Test n8n connection
     */
    async testN8nConnection() {
        // Cache n8n connection status for 60 seconds
        const cacheKey = 'n8n:connection:status';
        return this.cacheService.wrap(cacheKey, async () => {
            return this.n8nApiService.testConnection();
        }, 60);
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = CampaignsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        n8n_api_service_1.N8nApiService,
        n8n_converter_service_1.N8nConverterService])
], CampaignsService);
