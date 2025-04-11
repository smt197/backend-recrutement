import {
  Controller,
  Post,
  Get,
  Query,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UseFilters,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { JobService } from 'src/services/job.service';
import { CreateJobDto, UpdateJobDto } from 'src/dto/job.dto';
import { ForbiddenFilter } from 'src/filters/forbidden.filter';
import { JobResponseDto } from 'src/responses/response.job';
import { PrismaService } from 'prisma/prisma.service';

@Controller('jobs')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private prisma: PrismaService,
  ) {}

  @Post('add')
  @UseFilters(ForbiddenFilter)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUTEUR, Role.ADMIN)
  async createJob(
    @Req() req,
    @Body() dto: CreateJobDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobService.createJob(req.user.userId, dto);
    return {
      ...job,
      skills: Array.isArray(job.skills)
        ? (job.skills as string[])
        : job.skills
          ? JSON.parse(job.skills as string)
          : null,
      status: 'success',
      message: 'Job offer created successfully',
      recruiter: {
        id: job.recruiter.id,
        name: job.recruiter.name,
        email: job.recruiter.email,
        role: job.recruiter.role,
      },
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllJobs(
    @Query('page') pageString: string = '1',
    @Query('limit') limitString: string = '10',
    @Query('search') search?: string,
  ) {
    const page = parseInt(pageString, 10);
    const limit = parseInt(limitString, 10);

    // Utiliser les valeurs numériques
    return this.jobService.getAllJobs(page, limit, search);
  }

  @Get('titles')
  @UseGuards(JwtAuthGuard)
  async getAllJobTitles() {
    return this.prisma.jobPost
      .findMany({
        select: { title: true },
        distinct: ['title'],
      })
      .then((jobs) => jobs.map((j) => j.title));
  }

  @Get(':id')
  async getJobById(@Param('id') id: string) {
    return this.jobService.getJobById(Number(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUTEUR, Role.ADMIN)
  async updateJob(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @Req() req,
  ) {
    // Ajoutez ici une vérification que le recruteur est bien le propriétaire du job
    return this.jobService.updateJob(Number(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUTEUR, Role.ADMIN)
  async deleteJob(@Param('id') id: string, @Req() req) {
    // Ajoutez ici une vérification que le recruteur est bien le propriétaire du job
    return this.jobService.deleteJob(Number(id));
  }
}
