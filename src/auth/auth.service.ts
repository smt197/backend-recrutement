import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';


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
        const payload = { email: user.email, sub: user.id };
        return {
           Message: 'Login Successfull',
           StausCode: '200',
           ...user,
           access_token: this.jwtService.sign(payload),
          };
      }
    
      async register(email: string, password: string) {
        return this.userService.createUser(email, password);
      }

      async findUserByEmail(email: string) {
        return this.userService.findUserByEmail(email);
      }
}
