import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserValidationService } from '../services/UserValidationService';
import { Role } from '../auth/roles.enum';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private userValidationService: UserValidationService,
  ) {}

  async createUser(email: string, password: string, role: Role) {
    // Valider les données d'entrée
    await this.userValidationService.validateCreateUserRequest({ email, password, user_type: role });

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hashedPassword, role },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
