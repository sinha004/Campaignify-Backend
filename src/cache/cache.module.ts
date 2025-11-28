import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isEnabled = configService.get<string>('REDIS_ENABLED') === 'true';
        
        if (!isEnabled) {
          console.log('Redis caching is disabled');
          return {
            ttl: 0,
          };
        }

        try {
          const store = await redisStore({
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
            db: configService.get<number>('REDIS_DB', 0),
            ttl: configService.get<number>('CACHE_TTL', 300) * 1000, // Convert to milliseconds
          });

          console.log('Redis cache store initialized successfully');
          
          return {
            store,
            ttl: configService.get<number>('CACHE_TTL', 300) * 1000,
          };
        } catch (error) {
          console.error('Failed to initialize Redis cache store:', (error as Error).message);
          console.log('Falling back to in-memory cache');
          return {
            ttl: configService.get<number>('CACHE_TTL', 300) * 1000,
          };
        }
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
