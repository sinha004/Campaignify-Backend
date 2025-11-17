import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleModule } from './modules/example/example.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ExampleModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}