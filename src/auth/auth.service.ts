import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

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

    // Si 2FA est activé, ne pas envoyer le token tout de suite
    if (user.isTwoFA) {
      const tempToken = this.jwtService.sign(
        {
          id: user.id, // <-- Ici on met "id" au lieu de "sub"
          twoFA: true,
          email: user.email,
          role: user.role,
        },
        { expiresIn: '5m' },
      );
      const otpauthUrl = authenticator.keyuri(
        user.id,
        'GestionCandidature',
        user.twoFASecret,
      );
      const qrCode = await QRCode.toDataURL(otpauthUrl);

      return {
        message: '2FA required',
        requires2FA: true,
        userId: user.id,
        temp_token: tempToken,
        qrCode,
      };
    }

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
    const keyUri = await this.userService.enable2FA(userId);
    const qrCodeDataUrl = await QRCode.toDataURL(keyUri); // image en base64

    return {
      message: '2FA enabled successfully',
      keyUri,
      qrCode: qrCodeDataUrl,
    };
  }

  async disable2FA(userId: string) {
    await this.userService.disable2FA(userId);
    return {
      message: '2FA disabled successfully',
    };
  }

  async verify2FA(userId: string, token: string) {
    const user = await this.userService.findUserById(userId);
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

  async generateJwt(user: any) {
    const payload = {
      email: user.email,
      id: user.id,
      role: user.role,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  async findUserByEmail(email: string) {
    return this.userService.findUserByEmail(email);
  }

  async register(name: string, email: string, password: string, role: Role) {
    return this.userService.createUser(name, email, password, role);
  }
}
