import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IsArray, IsInt, Min, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Role } from '@prisma/client';

class CreateUserRequest {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(['CANDIDAT', 'RECRUTEUR', 'ADMIN'])
  role?: Role;

  @IsOptional()
  @IsString()
  @MinLength(9)
  @MaxLength(14)
  phone_number?: string;
}

class CreateUserSimpleRequest {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  role?: Role;

  @IsOptional()
  @IsInt()
  @Min(0)
  experience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  @MinLength(9)
  @MaxLength(14)
  phone_number?: string;
}

@Injectable()
export class UserValidationService {
  async validateCreateUserRequest(data: CreateUserRequest) {
    const createUserInstance = plainToInstance(CreateUserRequest, data);
    const errors = await validate(createUserInstance);
    if (errors.length > 0) {
      const errorMessages = errors
        .flatMap((err) =>
          Object.values(err.constraints!).map((constraint) => `${constraint}`),
        )
        .join(', ');
      throw new HttpException(
        {
          error: 'Validation failed',
          message: errorMessages,
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  async validateCreateUserSimpleRequest(data: CreateUserSimpleRequest) {
    const createUserInstance = plainToInstance(CreateUserSimpleRequest, data);
    const errors = await validate(createUserInstance);
    if (errors.length > 0) {
      const errorMessages = errors
        .flatMap((err) =>
          Object.values(err.constraints!).map((constraint) => `${constraint}`),
        )
        .join(', ');
      throw new HttpException(
        {
          error: 'Validation failed',
          message: errorMessages,
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }
}
