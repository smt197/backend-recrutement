import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      id: user.id,
      role: user.role,
      name: user.name,
    };
    console.log(payload);
    return {
      Message: 'Login Successful',
      StatusCode: '200',
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(userId: string) {
    return this.userService.logout(userId);
  }

  async refreshToken(userId: string) {
    const user = await this.userService.findUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { email: user.email, id: user.id, role: user.role };
    return {
      Message: 'Token refreshed successfully',
      StatusCode: '200',
      ...user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserById(userId: string) {
    const user = await this.userService.findUserById(userId);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return {
      Message: 'User found successfully',
      StatusCode: '200',
      ...user,
    };
  }

  async enable2FA(userId: string) {
    return this.userService.enable2FA(userId);
  }

  async verify2FA(userId: string, token: string) {
    return this.userService.verify2FA(userId, token);
  }

  async registerUser(
    name: string,
    email: string,
    password: string,
    role: Role,
    experience: number,
    skills: string[],
  ) {
    return this.userService.createUserSimple(
      name,
      email,
      password,
      role,
      experience,
      skills,
    );
  }

  async findUserByEmail(email: string) {
    return this.userService.findUserByEmail(email);
  }

  async register(name: string, email: string, password: string, role: Role) {
    return this.userService.createUser(name, email, password, role);
  }
}
