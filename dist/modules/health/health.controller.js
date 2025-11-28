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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cache_service_1 = require("../../cache/cache.service");
let HealthController = class HealthController {
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    async check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
    async cacheCheck() {
        try {
            const testKey = 'health:test';
            const testValue = { timestamp: Date.now(), message: 'Redis is working!' };
            // Test write
            await this.cacheService.set(testKey, testValue, 10);
            // Test read
            const cached = await this.cacheService.get(testKey);
            // Test delete
            await this.cacheService.del(testKey);
            return {
                status: 'ok',
                redis: 'connected',
                test: cached ? 'passed' : 'failed',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                redis: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('cache'),
    (0, swagger_1.ApiOperation)({ summary: 'Check Redis cache connectivity' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "cacheCheck", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], HealthController);
