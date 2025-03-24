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
    const payload = { email: user.email, id: user.id, role: user.role };
    console.log(payload);
    return {
      Message: 'Login Successful',
      StatusCode: '200',
      ...user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async enable2FA(userId: string) {
    return this.userService.enable2FA(userId);
  }

  async verify2FA(userId: string, token: string) {
    return this.userService.verify2FA(userId,token);
  }

  async registerUser(name:string,email: string, password: string, role: Role) {
    return this.userService.createUserSimple(name,email, password, role);
  }

  async findUserByEmail(email: string) {
    return this.userService.findUserByEmail(email);
  }

  async register(name:string,email: string, password: string, role: Role) {
    return this.userService.createUser(name,email, password, role);
  }
}
