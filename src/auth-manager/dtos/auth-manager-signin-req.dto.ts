import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../constants/role.enum';

export class AuthManagerSigninReq {
  constructor(copy?: AuthManagerSigninReq) {
    Object.assign(this, copy);
  }

  @IsNotEmpty()
  @IsEmail()
  @MinLength(8)
  @ApiProperty({ example: 'super@admin.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty({ example: Role.superadmin })
  password: string;
}
