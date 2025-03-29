import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateJobDto {
  @IsNumber()
  @IsOptional()
  id?: number;
  
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsNumber()
  @IsNotEmpty()
  experience: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @IsNotEmpty()
  deadline: Date;
}

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  experience?: number;

  @IsArray()
  @IsOptional()
  @Type(() => String)
  skills?: string[];

  @IsOptional()
  deadline?: Date;
}
