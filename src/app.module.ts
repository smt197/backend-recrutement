import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JobController } from './job/job.controller';
import { JobService } from './services/job.service';
import { ApplicationService } from './services/application/application.service';
import { ApplicationController } from './application/application.controller';
import { CloudinaryService } from './services/cloudinary/cloudinary.service';
import { CloudinaryConfig } from './config/cloudinary.config';
import { MulterConfigService } from './config/multer';


@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UserModule,
    PrismaModule
  ],
  controllers: [AppController,JobController, ApplicationController],
  providers: [AppService, JobService, ApplicationService, CloudinaryService,CloudinaryConfig, MulterConfigService],
})
export class AppModule {}
