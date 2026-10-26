import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

// Costo del cifrado: más alto = más seguro pero más lento. 10 es el valor habitual.
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

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
}
