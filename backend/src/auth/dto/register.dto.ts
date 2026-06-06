import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  username!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @MinLength(6)
  password!: string;
}
