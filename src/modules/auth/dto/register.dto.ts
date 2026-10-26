import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Datos que el cliente envía para registrarse.
 * El ValidationPipe global rechaza con 400 cualquier petición que no cumpla
 * estas reglas o que traiga campos extra.
 */

export class RegisterDto {
  @ApiProperty({ example: 'Santiago Jiménez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  @ApiProperty({ example: 'santiago@correo.com' })
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @ApiProperty({ example: 'MiClaveSegura123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72)
  password: string;
}
