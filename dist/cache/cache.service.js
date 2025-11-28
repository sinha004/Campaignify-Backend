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
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let CacheService = class CacheService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    /**
     * Get a value from cache
     */
    async get(key) {
        try {
            const value = await this.cacheManager.get(key);
            return value || null;
        }
        catch (error) {
            console.error(`Cache get error for key ${key}:`, error.message);
            return null;
        }
    }
    /**
     * Set a value in cache with optional TTL
     */
    async set(key, value, ttl) {
        try {
            if (ttl) {
                await this.cacheManager.set(key, value, ttl * 1000); // Convert to milliseconds
            }
            else {
                await this.cacheManager.set(key, value);
            }
        }
        catch (error) {
            console.error(`Cache set error for key ${key}:`, error.message);
        }
    }
    /**
     * Delete a specific key from cache
     */
    async del(key) {
        try {
            await this.cacheManager.del(key);
        }
        catch (error) {
            console.error(`Cache delete error for key ${key}:`, error.message);
        }
    }
    /**
     * Delete multiple keys matching a pattern
     */
    async delPattern(pattern) {
        try {
            // For cache-manager v6, we need to access the underlying store
            const cacheStore = this.cacheManager;
            if (cacheStore.store && cacheStore.store.client && typeof cacheStore.store.client.keys === 'function') {
                const keys = await cacheStore.store.client.keys(pattern);
                if (keys && keys.length > 0) {
                    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
                }
            }
        }
        catch (error) {
            console.error(`Cache delete pattern error for ${pattern}:`, error.message);
        }
    }
    /**
     * Wrap a function with caching
     */
    async wrap(key, fn, ttl) {
        try {
            // Check cache first
            const cached = await this.get(key);
            if (cached !== null) {
                return cached;
            }
            // Execute function and cache result
            const result = await fn();
            await this.set(key, result, ttl);
            return result;
        }
        catch (error) {
            console.error(`Cache wrap error for key ${key}:`, error.message);
            // If caching fails, just execute the function
            return await fn();
        }
    }
    /**
     * Generate cache key for user-specific data
     */
    getUserKey(userId, resource, id) {
        if (id) {
            return `user:${userId}:${resource}:${id}`;
        }
        return `user:${userId}:${resource}`;
    }
    /**
     * Generate cache key for specific resource
     */
    getResourceKey(resource, id) {
        return `${resource}:${id}`;
    }
    /**
     * Invalidate all cache for a user
     */
    async invalidateUser(userId) {
        await this.delPattern(`user:${userId}:*`);
    }
    /**
     * Invalidate cache for a specific user resource
     */
    async invalidateUserResource(userId, resource) {
        await this.delPattern(`user:${userId}:${resource}*`);
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], CacheService);
