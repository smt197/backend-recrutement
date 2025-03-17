import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserValidationService } from '../services/UserValidationService';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private userValidationService: UserValidationService,
  ) {}

  async createUser(email: string, password: string) {
    // Valider les données d'entrée
    await this.userValidationService.validateCreateUserRequest({ email, password });

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
