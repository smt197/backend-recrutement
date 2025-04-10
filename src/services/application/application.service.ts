import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateApplicationDto } from '../../dto/application.dto';
import { Status } from '@prisma/client';
import { ApplicationResponseDto } from 'src/responses/reponse.application';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

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

    return applications.map(
      (app) =>
        new ApplicationResponseDto({
          ...app,
          candidate: {
            id: app.candidate.id,
            name: app.candidate.name,
            email: app.candidate.email,
            role: app.candidate.role,
          },
        }),
    );
  }

  async getApplicationsByJobTitle(title: string) {
    const job = await this.prisma.jobPost.findFirst({
      where: { title: { equals: title.toLowerCase() } },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const applications = await this.prisma.application.findMany({
      where: { jobId: job.id },
      include: {
        candidate: true,
        job: { select: { title: true, id: true } },
      },
    });

    return applications.map(
      (app) =>
        new ApplicationResponseDto({
          ...app,
          candidate: {
            id: app.candidate.id,
            name: app.candidate.name,
            email: app.candidate.email,
            role: app.candidate.role,
          },
          job: {
            id: app.job.id,
            title: app.job.title,
          },
        }),
    );
  }

  async getAllApplications(page: number = 1, limit: number = 10) {
    // Calculer l'offset pour la pagination
    const skip = (page - 1) * limit;

    const [applications, totalCount] = await Promise.all([
      this.prisma.application.findMany({
        skip,
        take: limit,
        include: {
          candidate: true,
          job: true,
        },
        orderBy: {
          createdAt: 'asc', // Tri par date de création décroissante
        },
      }),
      this.prisma.application.count(),
    ]);

    return {
      data: applications.map(
        (app) =>
          new ApplicationResponseDto({
            ...app,
            candidate: {
              id: app.candidate.id,
              name: app.candidate.name,
              email: app.candidate.email,
              role: app.candidate.role,
            },
            job: {
              id: app.job.id,
              title: app.job.title,
            },
          }),
      ),
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
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

  async filterCandidatesByTitle(title: string) {
    // 1. Trouver le job correspondant au titre
    const job = await this.prisma.jobPost.findFirst({
      where: {
        title: {
          contains: title.toLowerCase(),
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Aucun poste trouvé avec ce titre');
    }

    // 2. Récupérer les candidatures pour ce job
    const applications = await this.prisma.application.findMany({
      where: { jobId: job.id },
      include: { candidate: true },
    });

    if (!applications || applications.length === 0) {
      return [];
    }

    // 3. Filtrer par compétences et expérience (comme dans votre version originale)
    const jobSkills = Array.isArray(job.skills)
      ? job.skills
      : typeof job.skills === 'string'
        ? job.skills.split(',')
        : [];

    return applications.filter(
      (app) =>
        app.candidate.experience >= job.experience ||
        jobSkills.some(
          (skill) =>
            Array.isArray(app.candidate.skills) &&
            app.candidate.skills.includes(skill),
        ),
    );
  }
}
