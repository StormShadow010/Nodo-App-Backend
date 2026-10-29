import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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

  /**
   * POST /api/v1/auth/login
   * Responde 200 y no 201 (el default de @Post) porque no crea ningún recurso:
   * solo verifica credenciales y entrega un token.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description:
      'Credenciales válidas: devuelve accessToken y datos del usuario',
  })
  @ApiUnauthorizedResponse({ description: 'Correo o contraseña incorrectos' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
