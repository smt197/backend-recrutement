import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Req,
  BadRequestException,
  UseFilters,
  UseGuards,
  Patch,
  Param,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Role, Status } from '@prisma/client';
import { get } from 'http';
import { PrismaService } from 'prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateApplicationDto } from 'src/dto/application.dto';
import { ForbiddenFilter } from 'src/filters/forbidden.filter';
import { ApplicationResponseDto } from 'src/responses/reponse.application';
import { ApplicationService } from 'src/services/application/application.service';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { MailService } from 'src/services/email/mail.service';

@Controller('applications')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
    private prisma: PrismaService,
  ) {}

  @Post('add')
  @UseFilters(ForbiddenFilter)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CANDIDATE)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'coverLetter', maxCount: 1 },
      { name: 'portfolio', maxCount: 1 },
    ]),
  )
  async submitApplication(
    @UploadedFiles()
    files: {
      cv?: Express.Multer.File[];
      coverLetter?: Express.Multer.File[];
      portfolio?: Express.Multer.File[];
    },
    @Body() body: any,
    @Req() req,
  ) {
    // Validation des fichiers
    if (!files.cv || files.cv.length === 0) {
      throw new BadRequestException('CV is required');
    }

    // Vérifier si le poste existe et récupérer la date limite
    const jobId = await this.prisma.jobPost.findUnique({
      where: { id: parseInt(body.jobId, 10) },
      select: { deadline: true },
    });

    if (!jobId) {
      throw new NotFoundException('Job not found');
    }

    // Vérifier si la date limite est dépassée
    const currentDate = new Date();
    if (currentDate > jobId.deadline) {
      throw new BadRequestException(
        'The application deadline for this job has passed.',
      );
    }

    // Upload des fichiers vers Cloudinary
    const cvUrl = await this.cloudinaryService.uploadFile(files.cv[0], 'cv');
    const coverLetterUrl = files.coverLetter?.[0]
      ? await this.cloudinaryService.uploadFile(
          files.coverLetter[0],
          'cover_letters',
        )
      : undefined;
    const portfolioUrl = files.portfolio?.[0]
      ? await this.cloudinaryService.uploadFile(
          files.portfolio[0],
          'portfolios',
        )
      : undefined;

    // Récupérer le titre du poste
    const job = await this.prisma.jobPost.findUnique({
      where: { id: parseInt(body.jobId, 10) },
      select: { title: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Création de l'application
    const applicationData: CreateApplicationDto = {
      status: Status.PENDING,
      candidateId: req.user.userId,
      jobId: parseInt(body.jobId, 10),
      cvUrl,
      coverLetterUrl,
      portfolioUrl,
      consentGiven: body.consentGiven === 'true' || body.consentGiven === true,
    };

    const application = await this.applicationService.apply(applicationData);

    // Envoyer un e-mail de confirmation au candidat
    const candidateEmail = req.user.email; // Assurez-vous que l'e-mail du candidat est accessible
    const candidateName = req.user.name; // Assurez-vous que le nom du candidat est accessible
    await this.mailService.sendConfirmationEmail(
      candidateEmail,
      candidateName,
      job.title,
    );

    return application;
  }

  @Get() // Endpoint pour récupérer toutes les applications
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUTEUR, Role.ADMIN) // Seulement pour recruteurs et admins
  async getAllApplications() {
    return this.applicationService.getAllApplications();
  }


  @Get('job/by-title/:title/candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUTEUR)
  async getApplicationsByJobTitle(@Param('title') title: string) {
    return this.applicationService.getApplicationsByJobTitle(decodeURIComponent(title));
}

  //Met à jour le statut d'une candidature spécifique
  @Patch(':id/status')
  @UseFilters(ForbiddenFilter)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUTEUR)
  async updateStatus(@Param('id') id: string, @Body('status') status: Status) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    const updatedApplication =
      await this.applicationService.updateApplicationStatus(numericId, status);

    // Personnaliser le message en fonction du statut
    let statusMessage;
    switch (status) {
      case Status.ACCEPTED:
        statusMessage = 'Votre candidature a été approuvée. Félicitations !';
        break;
      case Status.REJECTED:
        statusMessage =
          "Votre candidature a été rejetée. Nous vous encourageons à postuler à nouveau à l'avenir.";
        break;
      case Status.PENDING:
        statusMessage = 'Votre candidature est en cours de révision.';
        break;
      default:
        statusMessage = 'Le statut de votre candidature a été mis à jour.';
    }

    // Envoyer un e-mail au candidat
    const candidateEmail = updatedApplication.candidate.email; // Assurez-vous que l'e-mail du candidat est accessible
    const subject = 'Mise à jour du statut de votre candidature';

    await this.mailService.sendMail(
      candidateEmail,
      subject,
      {
        name: updatedApplication.candidate.name,
        statusMessage,
      },
      'src/services/email/email-template.hbs',
    );

    return updatedApplication;
  }

  //Filtre les candidats pour un poste donné en fonction des compétences et de l'expérience requises pour le poste.
  @Get('filter/:jobId')
  async filterCandidates(@Param('jobId') jobId: string) {
    const numericId = parseInt(jobId, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.applicationService.filterCandidates(numericId);
  }

  //Récupère toutes les candidatures pour un poste spécifique.
  @Get('job/:jobId/candidates')
  @UseFilters(ForbiddenFilter)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUTEUR)
  async getCandidatesForJob(@Param('jobId') jobId: string) {
    const numericId = parseInt(jobId, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.applicationService.getApplicationsForJob(numericId);
  }

  //Récupère une candidature spécifique pour un poste donné en fonction de l'ID du candidat.
  @Get('job/:jobId/candidates/:candidateId')
  @UseFilters(ForbiddenFilter)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUTEUR)
  async getCandidateForJob(
    @Param('jobId') jobId: string,
    @Param('candidateId') candidateId: string,
  ) {
    const numericId = parseInt(jobId, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    const numericCandidateId = parseInt(candidateId, 10);
    if (isNaN(numericCandidateId)) {
      throw new BadRequestException('Invalid candidate ID format');
    }
    const applications =
      await this.applicationService.getApplicationsForJob(numericId);
    return applications.find(
      (application) => application.candidate.id === numericCandidateId,
    );
  }
}
