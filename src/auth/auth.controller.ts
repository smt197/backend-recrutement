import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  UseFilters,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';
import { ForbiddenFilter } from 'src/filters/forbidden.filter';
import { MailService } from 'src/services/email/mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role?: Role;
      experience?: number;
      skills?: string[];
    },
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
      const result = await this.authService.registerUser(
        body.name,
        body.email,
        body.password,
        role,
        body.experience ?? 1,
        body.skills ?? [],
      );
      await this.mailService.sendRegistrationEmail(body.email, body.name);
      return result;
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

  @Post('enable-2fa')
  @UseGuards(JwtAuthGuard)
  async enable2FA(@Request() req) {
    return this.authService.enable2FA(req.user.userId);
  }

  @Post('verify-2fa')
  @UseGuards(JwtAuthGuard)
  async verify2FA(@Request() req, @Body('token') token: string) {
    return this.authService.verify2FA(req.user.userId, token);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }
  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    try {
      const result = await this.authService.logout(req.user.userId);
      if (!result) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Déconnexion réussie',
        success: true,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erreur lors de la déconnexion',
          success: false,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('verify-token')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Request() req) {
    // Le guard JwtAuthGuard valide déjà le token
    // On retourne les infos utilisateur si besoin
    return {
      access_token: req.headers.authorization.split(' ')[1],
      user: req.user, // Les infos décodées du JWT
    };
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
