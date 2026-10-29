import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'santiago@correo.com' })
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @ApiProperty({ example: 'MiClaveSegura123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}
