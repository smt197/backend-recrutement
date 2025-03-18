import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import {
//   ApiBearerAuth,
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
// } from '@nestjs/swagger';

@Controller('user')

export class UserController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Seuls les ADMIN peuvent accéder
  @Get()
  findAll(@Request() req) {
    return 'Liste des utilisateurs';
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
