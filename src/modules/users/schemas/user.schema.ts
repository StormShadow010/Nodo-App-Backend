import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

/**
 * Usuario de la aplicación.
 * timestamps: agrega createdAt y updatedAt automáticamente.
 * versionKey: false → elimina el campo interno __v.
 */
@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, trim: true, maxlength: 60 })
  name: string;

  // unique crea un índice en Mongo: la base misma impide correos repetidos
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // select: false → nunca se devuelve en las consultas, salvo que se pida explícitamente
  @Prop({ required: true, select: false })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
