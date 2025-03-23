import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';
import { ForbiddenFilter } from 'src/filters/forbidden.filter';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: { name: string; email: string; password: string; role?: Role },
  ) {
    // Si aucun rôle n'est spécifié, définir par défaut sur CANDIDAT
    const role = body.role || Role.CANDIDATE;

    // console.log(role);

    // Vérifier si l'utilisateur essaie de s'inscrire en tant que RECRUTEUR ou ADMIN
    if (role === Role.RECRUTEUR || role === Role.ADMIN) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // Vérifier si l'email existe déjà dans la base de données
    const user = await this.authService.findUserByEmail(body.email);
    if (user) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    try {
      return await this.authService.registerUser(
        body.name,
        body.email,
        body.password,
        role,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register/admin')
  @UseFilters(ForbiddenFilter)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async registerAdmin(
    @Body() body: { name: string; email: string; password: string; role: Role },
  ) {
    // const currentUser = req.user;
    // Vérifier si l'email existe déjà dans la base de données
    const user = await this.authService.findUserByEmail(body.email);
    if (user) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    try {
      return await this.authService.register(
        body.name,
        body.email,
        body.password,
        body.role,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
