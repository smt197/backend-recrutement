import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateApplicationDto } from '../../dto/application.dto';
import { Status } from '@prisma/client';
import { ApplicationResponseDto } from 'src/responses/reponse.application';


@Injectable()
export class ApplicationService {

  constructor(
    private prisma: PrismaService,

  ) {}

  async apply(dto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: dto,
    });
  }

  async getApplicationsForJob(jobId: number) {
    const applications = await this.prisma.application.findMany({
      where: { jobId },
      include: { candidate: true },
    });

    return applications.map(app => new ApplicationResponseDto({
      ...app,
      candidate: {
        id: app.candidate.id,
        name: app.candidate.name,
        email: app.candidate.email,
        role: app.candidate.role,
      },
    }));
  }


  async updateApplicationStatus(id: number, status: Status) {

    // verifier si le status existe
    const validStatuses = Object.values(Status);
    if (!validStatuses.includes(status)) {
      throw new NotFoundException('Invalid status');
    }
    // Vérifiez si l'application existe
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id },
      data: { status },
      include: { candidate: true }, // Inclure les informations du candidat
    });
  
    // Utilisez le DTO pour formater la réponse
    return new ApplicationResponseDto({
      ...updatedApplication,
      candidate: {
        id: updatedApplication.candidate.id,
        name: updatedApplication.candidate.name,
        email: updatedApplication.candidate.email,
        role: updatedApplication.candidate.role,
      },
    });
  }
  

  async filterCandidates(jobId: number) {
    const job = await this.prisma.jobPost.findUnique({
      where: { id: jobId },
    });
  
    if (!job) {
      throw new NotFoundException('Job not found');
    }
  
    const applications = await this.prisma.application.findMany({
      where: { jobId },
      include: { candidate: true },
    });

    if (!applications || applications.length === 0) {
      return [];
    }
  
    // Vérifiez que job.skills est une chaîne de caractères
    const jobSkills = Array.isArray(job.skills) ? job.skills : (typeof job.skills === 'string' ? job.skills.split(',') : []);
  
    return applications.filter(app =>
      app.candidate.experience >= job.experience &&
      jobSkills.some(skill =>
        Array.isArray(app.candidate.skills) && app.candidate.skills.includes(skill)
      )
    );
  }
  
}
