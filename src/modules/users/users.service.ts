import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Crea un usuario. Recibe la contraseña YA cifrada.
   * Devuelve el usuario sin la contraseña.
   */
  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<UserDocument> {
    const created = await this.userModel.create({
      name: data.name,
      email: data.email,
      password: data.passwordHash,
    });
    // Se vuelve a consultar para que select:false excluya la contraseña de la respuesta
    return (await this.userModel.findById(created._id).exec())!;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return (await this.userModel.exists({ email })) !== null;
  }

  /**
   * Busca por correo. Con withPassword=true incluye el hash (solo para el login).
   */
  async findByEmail(
    email: string,
    withPassword = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email });
    if (withPassword) query.select('+password');
    return query.exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}
