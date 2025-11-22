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
exports.SegmentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const segments_service_1 = require("./segments.service");
const upload_segment_dto_1 = require("./dto/upload-segment.dto");
let SegmentsController = class SegmentsController {
    constructor(segmentsService) {
        this.segmentsService = segmentsService;
    }
    /**
     * Upload a new segment CSV file
     */
    async uploadSegment(file, uploadSegmentDto, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const userId = req.user.userId;
        const segment = await this.segmentsService.uploadSegment(userId, file, uploadSegmentDto.name);
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
    async getAllSegments(req) {
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
    async getSegment(id, req) {
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
    async getDownloadUrl(id, req) {
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
    async deleteSegment(id, req) {
        const userId = req.user.userId;
        const result = await this.segmentsService.deleteSegment(id, userId);
        return {
            success: true,
            message: result.message,
        };
    }
};
exports.SegmentsController = SegmentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a customer segment CSV file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Segment uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file format or size' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid JWT token' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_segment_dto_1.UploadSegmentDto, Object]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "uploadSegment", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all segments for the logged-in user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns list of user segments' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "getAllSegments", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get segment details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns segment details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Segment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied to this segment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "getSegment", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate presigned S3 URL to download segment CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns presigned download URL (valid for 1 hour)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Segment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a segment (soft delete in DB, removes from S3)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Segment deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Segment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "deleteSegment", null);
exports.SegmentsController = SegmentsController = __decorate([
    (0, swagger_1.ApiTags)('Customer Segments'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('segments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [segments_service_1.SegmentsService])
], SegmentsController);
