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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const campaigns_service_1 = require("./campaigns.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_campaign_dto_1 = require("./dto/create-campaign.dto");
const update_campaign_dto_1 = require("./dto/update-campaign.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const save_flow_dto_1 = require("./dto/save-flow.dto");
const campaign_response_dto_1 = require("./dto/campaign-response.dto");
let CampaignsController = class CampaignsController {
    constructor(campaignsService) {
        this.campaignsService = campaignsService;
    }
    async create(req, createCampaignDto) {
        return this.campaignsService.create(req.user.userId, createCampaignDto);
    }
    async findAll(req) {
        return this.campaignsService.findAll(req.user.userId);
    }
    async getStatistics(req) {
        return this.campaignsService.getStatistics(req.user.userId);
    }
    async findOne(id, req) {
        return this.campaignsService.findOne(id, req.user.userId);
    }
    async update(id, req, updateCampaignDto) {
        return this.campaignsService.update(id, req.user.userId, updateCampaignDto);
    }
    async updateStatus(id, req, updateStatusDto) {
        return this.campaignsService.updateStatus(id, req.user.userId, updateStatusDto.status);
    }
    async saveFlow(id, req, saveFlowDto) {
        return this.campaignsService.saveFlow(id, req.user.userId, saveFlowDto);
    }
    async getFlow(id, req) {
        return this.campaignsService.getFlow(id, req.user.userId);
    }
    async delete(id, req) {
        return this.campaignsService.delete(id, req.user.userId);
    }
};
exports.CampaignsController = CampaignsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new campaign' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Campaign created successfully',
        type: campaign_response_dto_1.CampaignResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Segment not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_campaign_dto_1.CreateCampaignDto]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all campaigns for the current user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of campaigns retrieved successfully',
        type: [campaign_response_dto_1.CampaignResponseDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get campaign statistics for the current user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign statistics retrieved successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a campaign by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign retrieved successfully',
        type: campaign_response_dto_1.CampaignResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign updated successfully',
        type: campaign_response_dto_1.CampaignResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data or campaign status' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_campaign_dto_1.UpdateCampaignDto]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update campaign status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campaign status updated successfully',
        type: campaign_response_dto_1.CampaignResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status transition' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_status_dto_1.UpdateStatusDto]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Save flow builder data for a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Flow data saved successfully',
        type: campaign_response_dto_1.CampaignResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, save_flow_dto_1.SaveFlowDto]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "saveFlow", null);
__decorate([
    (0, common_1.Get)(':id/flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Get flow builder data for a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Flow data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "getFlow", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a campaign' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Campaign ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Campaign deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete running campaign' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campaign not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "delete", null);
exports.CampaignsController = CampaignsController = __decorate([
    (0, swagger_1.ApiTags)('Campaigns'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('campaigns'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [campaigns_service_1.CampaignsService])
], CampaignsController);
