import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
/**
 * Rutas de autenticación: /api/v1/auth/...
 * El controller solo recibe la petición y delega al service; no tiene lógica.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   * El ValidationPipe valida el body con RegisterDto antes de llegar aquí.
   */

  @Post('register')
  @ApiCreatedResponse({
    description: 'Usuario creado (sin contraseña en la respuesta)',
  })
  @ApiConflictResponse({ description: 'El correo ya está registrado' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
