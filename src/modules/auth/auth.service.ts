import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

// Costo del cifrado: más alto = más seguro pero más lento. 10 es el valor habitual.
const SALT_ROUNDS = 10;
const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Normalizar el correo antes de buscar y de guardar
    const email = dto.email.trim().toLowerCase();
    // 2. Si ya existe, cortar con 409
    if (await this.userService.existsByEmail(email)) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    // 3. Cifrar la contraseña: nunca se guarda en texto plano
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    // 4. Crear el usuario con el correo normalizado y el hash
    return this.userService.create({
      name: dto.name.trim(),
      email,
      passwordHash,
    });
  }
  async login(dto: LoginDto) {
    // 1. Normalizar el correo
    const email = dto.email.trim().toLowerCase();
    // 2. Buscar el usuario con el email (Verificación)
    const user = await this.userService.findByEmail(email, true);
    // 3. excepción 401
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    // 4. Compara dto.password con user.password usando bcrypt.compare
    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    // 5. Si no coincide → la MISMA excepción y el MISMO mensaje del TODO 3
    if (!passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    // 6. firma el token con un payload { sub: <id del usuario> }
    const payload = { sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    // 7. retorna { accessToken, user: { id, name, email } }
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
