import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserValidationService } from '../services/UserValidationService';
import { Role } from '@prisma/client';
import { authenticator } from 'otplib';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private userValidationService: UserValidationService,
  ) {}

  async createUser(name: string, email: string, password: string, role: Role) {
    // Valider les données d'entrée
    await this.userValidationService.validateCreateUserRequest({
      name,
      email,
      password,
      role,
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });
  }

  async createUserSimple(
    name: string,
    email: string,
    password: string,
    role: Role,
    experience: number = 1,
    skills: string[] = [],
  ) {
    await this.userValidationService.validateCreateUserSimpleRequest({
      name,
      email,
      password,
      role,
      experience,
      skills,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        experience,
        skills,
      },
    });
  }
  async enable2FA(userId: string) {
    const secret = authenticator.generateSecret();
    // console.log(secret);
    await this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: { twoFASecret: secret, isTwoFA: true },
    });

    return authenticator.keyuri(userId, 'GestionCandidature', secret);
  }

  async verify2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!user || !user.twoFASecret) {
      throw new BadRequestException('2FA not enabled');
    }

    const isValid = authenticator.verify({ token, secret: user.twoFASecret });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA token');
    }

    return isValid;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: parseInt(userId) } });
  }
  async logout(userId: string) {
    return this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isLoggedIn: false },
    });
  }
}
