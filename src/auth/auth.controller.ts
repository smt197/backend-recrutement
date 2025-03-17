import { Controller, Post, Body, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserValidationService } from '../services/UserValidationService';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {

    //VERIFIER SI LE  MAIL EXISTE DANS LA BASE DE DONNEE
    const user = await this.authService.findUserByEmail(body.email);
    if (user) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }
    try {
      return await this.authService.register(body.email, body.password);
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
    console.log(req.user);
    return req.user;
}
}
