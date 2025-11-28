import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheService } from '../../cache/cache.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private cacheService: CacheService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('cache')
  @ApiOperation({ summary: 'Check Redis cache connectivity' })
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
    } catch (error) {
      return {
        status: 'error',
        redis: 'disconnected',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
