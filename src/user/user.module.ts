import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserValidationService } from '../services/UserValidationService';

@Module({
  controllers: [UserController],
  providers: [UserService,UserValidationService],
  exports: [UserService,UserValidationService],
})
export class UserModule {}
