import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from 'src/dto/job.dto';
import { MailService } from './email/mail.service';

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService

  ) {}

  async createJob(recruiterId: number, dto: CreateJobDto) {
    const newJob = await this.prisma.jobPost.create({
      data: {
        ...dto,
        recruiterId,
      },
      include: {
        recruiter: true, // Inclure les informations du recruteur
      },
    });

    // Récupérer tous les candidats
    const candidates = await this.prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      select: { id: true, name: true, email: true },
    });

    // Envoyer un e-mail à chaque candidat
    for (const candidate of candidates) {
      await this.mailService.sendNewJobEmail(
        candidate.email,
        candidate.name,
        newJob.title,
        newJob.description,
        newJob.deadline.toISOString().split('T')[0], // Format de la date
        (newJob.skills as string[]).join(', '), // Convertir les compétences en chaîne de caractères
        newJob.experience
      );
    }

    return newJob;
  }

  async getAllJobs() {
    return this.prisma.jobPost.findMany();
  }

  async getJobsByRecruiter(recruiterId: number) {
    return this.prisma.jobPost.findMany({
      where: { recruiterId },
    });
  }


  async getJobById(id: number) {
    return this.prisma.jobPost.findUnique({ where: { id } });
  }

  async updateJob(id: number, dto: UpdateJobDto) {
    return this.prisma.jobPost.update({
      where: { id },
      data: { ...dto },
    });
  }

  async deleteJob(id: number) {
    return this.prisma.jobPost.delete({ where: { id } });
  }
}
