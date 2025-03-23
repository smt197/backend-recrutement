import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserValidationService } from '../services/UserValidationService';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private userValidationService: UserValidationService,
  ) {}

  async createUser(name:string, email: string, password: string, role: Role) {
    // Valider les données d'entrée
    await this.userValidationService.validateCreateUserRequest({name, email, password, role});

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {name, email, password: hashedPassword, role },
    });
  }

  async createUserSimple(name:string, email: string, password: string, role: Role) {
    // Valider les données d'entrée
    await this.userValidationService.validateCreateUserSimpleRequest({name, email, password, role});

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {name, email, password: hashedPassword, role },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
