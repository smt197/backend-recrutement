import { 
    Controller, Post, Body, UploadedFiles, UseInterceptors, Req, 
    BadRequestException, UseFilters, UseGuards 
  } from '@nestjs/common';
  import { FileFieldsInterceptor } from '@nestjs/platform-express';
  import { Role, Status } from '@prisma/client';
  import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
  import { Roles } from 'src/auth/roles.decorator';
  import { RolesGuard } from 'src/auth/roles.guard';
  import { CreateApplicationDto } from 'src/dto/application.dto';
  import { ForbiddenFilter } from 'src/filters/forbidden.filter';
  import { ApplicationService } from 'src/services/application/application.service';
  import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
  
  @Controller('applications')
  export class ApplicationController {
    constructor(
      private readonly applicationService: ApplicationService,
      private readonly cloudinaryService: CloudinaryService
    ) {}
  
    @Post('add')
    @UseFilters(ForbiddenFilter)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.CANDIDATE)
    @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'cv', maxCount: 1 },
        { name: 'coverLetter', maxCount: 1 },
        { name: 'portfolio', maxCount: 1 }
      ])
    )
    async submitApplication(
      @UploadedFiles() files: { 
        cv?: Express.Multer.File[], 
        coverLetter?: Express.Multer.File[], 
        portfolio?: Express.Multer.File[] 
      },
      @Body() body: any,
      @Req() req
    ) {
      // Validation des fichiers
      if (!files.cv || files.cv.length === 0) {
        throw new BadRequestException('CV is required');
      }
  
      // Upload des fichiers vers Cloudinary
      const cvUrl = await this.cloudinaryService.uploadFile(files.cv[0], 'cv');
      const coverLetterUrl = files.coverLetter?.[0] 
        ? await this.cloudinaryService.uploadFile(files.coverLetter[0], 'cover_letters') 
        : undefined;
      const portfolioUrl = files.portfolio?.[0] 
        ? await this.cloudinaryService.uploadFile(files.portfolio[0], 'portfolios') 
        : undefined;
  
      // Création de l'application
      const applicationData: CreateApplicationDto = {
        status: Status.PENDING,
        candidateId: req.user.userId,
        jobId: parseInt(body.jobId, 10),
        cvUrl,
        coverLetterUrl,
        portfolioUrl,
        consentGiven: body.consentGiven === 'true' || body.consentGiven === true
      };
  
      return this.applicationService.apply(applicationData);
    }
  }
  