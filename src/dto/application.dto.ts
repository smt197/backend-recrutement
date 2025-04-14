import { Status } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsDate,
} from 'class-validator';

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
