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
exports.CampaignResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CampaignResponseDto {
}
exports.CampaignResponseDto = CampaignResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], CampaignResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who created the campaign', example: 1 }),
    __metadata("design:type", Number)
], CampaignResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Segment ID being targeted', example: '123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], CampaignResponseDto.prototype, "segmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign name', example: 'Summer Sale Campaign' }),
    __metadata("design:type", String)
], CampaignResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign description', example: 'Promotional campaign for summer products', nullable: true }),
    __metadata("design:type", String)
], CampaignResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign start date', example: '2025-12-01T00:00:00Z' }),
    __metadata("design:type", Date)
], CampaignResponseDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign end date', example: '2025-12-31T23:59:59Z' }),
    __metadata("design:type", Date)
], CampaignResponseDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign status', example: 'draft', enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'failed'] }),
    __metadata("design:type", String)
], CampaignResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total users targeted', example: 1500 }),
    __metadata("design:type", Number)
], CampaignResponseDto.prototype, "totalUsersTargeted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total jobs created', example: 1500 }),
    __metadata("design:type", Number)
], CampaignResponseDto.prototype, "totalJobsCreated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total messages sent', example: 1200 }),
    __metadata("design:type", Number)
], CampaignResponseDto.prototype, "totalSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total failed messages', example: 50 }),
    __metadata("design:type", Number)
], CampaignResponseDto.prototype, "totalFailed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Flow builder data (React Flow JSON)', nullable: true }),
    __metadata("design:type", Object)
], CampaignResponseDto.prototype, "flowData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign creation timestamp', example: '2025-11-22T10:00:00Z' }),
    __metadata("design:type", Date)
], CampaignResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign last update timestamp', example: '2025-11-22T15:30:00Z' }),
    __metadata("design:type", Date)
], CampaignResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Segment details', required: false }),
    __metadata("design:type", Object)
], CampaignResponseDto.prototype, "segment", void 0);
