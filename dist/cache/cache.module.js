"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const cache_manager_ioredis_yet_1 = require("cache-manager-ioredis-yet");
const cache_service_1 = require("./cache.service");
let CacheModule = class CacheModule {
};
exports.CacheModule = CacheModule;
exports.CacheModule = CacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const isEnabled = configService.get('REDIS_ENABLED') === 'true';
                    if (!isEnabled) {
                        console.log('Redis caching is disabled');
                        return {
                            ttl: 0,
                        };
                    }
                    try {
                        const store = await (0, cache_manager_ioredis_yet_1.redisStore)({
                            host: configService.get('REDIS_HOST', 'localhost'),
                            port: configService.get('REDIS_PORT', 6379),
                            password: configService.get('REDIS_PASSWORD') || undefined,
                            db: configService.get('REDIS_DB', 0),
                            ttl: configService.get('CACHE_TTL', 300) * 1000, // Convert to milliseconds
                        });
                        console.log('Redis cache store initialized successfully');
                        return {
                            store,
                            ttl: configService.get('CACHE_TTL', 300) * 1000,
                        };
                    }
                    catch (error) {
                        console.error('Failed to initialize Redis cache store:', error.message);
                        console.log('Falling back to in-memory cache');
                        return {
                            ttl: configService.get('CACHE_TTL', 300) * 1000,
                        };
                    }
                },
            }),
        ],
        providers: [cache_service_1.CacheService],
        exports: [cache_service_1.CacheService, cache_manager_1.CacheModule],
    })
], CacheModule);
