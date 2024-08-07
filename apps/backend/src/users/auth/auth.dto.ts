import { Optional } from '@nestjs/common';
import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';

export class AuthLoginDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}

export class AuthRegisterDTO {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsOptional()
  inviteCode: string;
}

export class AuthPasswordChangeDTO {
  @IsString()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  newPassword: string;
}

export class AuthRefreshDTO {
  @IsString()
  refreshToken: string;
}
