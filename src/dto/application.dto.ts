import { Status } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum, IsDate } from 'class-validator';

// export enum Status {
//     PENDING = "PENDING",
//     PRESELECTED = "PRESELECTED",
//     REJECTED = "REJECTED",
//     INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED",
//     ACCEPTED = "ACCEPTED",
// }

export class CreateApplicationDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsEnum(Status)
  @IsOptional() 
  status?: Status;

  @IsNumber()
  @IsOptional()
  candidateId: number;

  @IsNumber()
  @IsNotEmpty()
  jobId: number;

  @IsString()
  @IsNotEmpty()
  cvUrl: string;

  @IsString()
  @IsOptional()
  coverLetterUrl?: string;

  @IsString()
  @IsOptional()
  portfolioUrl?: string;

  @IsBoolean()
  @IsOptional()
  consentGiven: boolean;

}