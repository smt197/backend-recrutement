import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { Role } from 'src/auth/roles.enum';

export class LoginDto {
  @IsEmail({}, { message: 'Veuillez fournir un email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}

export class RegisterDto {

  @IsString({ message: 'Le role doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le role est requis' })
  @Matches(/(ADMIN|RECRUTEUR|CANDIDAT)/, {
    message: 'Le role doit être ADMIN, RECRUTEUR ou CANDIDAT',
  })
  role: Role;
  @IsEmail({}, { message: 'Veuillez fournir un email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre',
  })
  password: string;
}
