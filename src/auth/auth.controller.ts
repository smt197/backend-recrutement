import { Controller, Post, Body, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Role } from './roles.enum';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(@Request() req, @Body() body: { email: string; password: string, role?: Role }) {
    const currentUser = req.user;
    console.log(currentUser);

    // Si aucun rôle n'est spécifié, définir par défaut sur CANDIDAT
    const role = body.role || Role.CANDIDAT;

    // Vérifier si l'utilisateur actuel est un ADMIN pour inscrire un RECRUTEUR ou un ADMIN
    if (role === Role.RECRUTEUR || role === Role.ADMIN) {
      if (!currentUser || currentUser.role !== Role.ADMIN) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    }

    // Vérifier si l'email existe déjà dans la base de données
    const user = await this.authService.findUserByEmail(body.email);
    if (user) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    try {
      return await this.authService.register(body.email, body.password, role);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
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
