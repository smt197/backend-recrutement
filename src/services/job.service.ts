import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from 'src/dto/job.dto';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async createJob(recruiterId: number, dto: CreateJobDto) {
    return this.prisma.jobPost.create({
      data: {
        ...dto,
        recruiterId,
      },
      include: {
        recruiter: true, // Inclure les informations du recruteur
      },
    });
  }

  async getAllJobs() {
    return this.prisma.jobPost.findMany();
  }

//   async getJobById(jobId: number) {
//     return this.prisma.jobPost.findUnique({
//         where: { id: jobId },
  
//     });
//   }

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
