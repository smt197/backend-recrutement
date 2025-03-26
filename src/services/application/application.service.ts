import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateApplicationDto } from '../../dto/application.dto';
import { Status } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async apply(dto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: dto
    });
  }

  async getApplicationsForJob(jobId: number) {
    return this.prisma.application.findMany({
      where: { jobId },
    });
  }

  async updateApplicationStatus(id: number, status: Status) {
    return this.prisma.application.update({
      where: { id },
      data: { status },
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
  
    return applications.filter(app => 
      app.candidate.experience >= job.experience &&
      typeof job.skills === 'string' && job.skills.split(',').some(skill => 
        Array.isArray(app.candidate.skills) && app.candidate.skills.includes(skill)
      )
    );
  }
  
}
