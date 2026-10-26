import * as Joi from 'joi';

/**
 * Esquema de validación de las variables de entorno.
 *
 * Se ejecuta al arrancar la aplicación: si falta una variable obligatoria
 * o tiene un formato inválido, la app NO arranca y muestra el error.
 * Así evitamos fallos silenciosos en tiempo de ejecución
 * (por ejemplo, descubrir que no hay conexión a Mongo hasta la primera petición).
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  // Acepta tanto Atlas (mongodb+srv://) como una instancia local (mongodb://)
  MONGO_URI: Joi.string()
    .pattern(/^mongodb(\+srv)?:\/\//)
    .required()
    .messages({
      'string.pattern.base':
        'MONGO_URI debe empezar por mongodb:// o mongodb+srv://',
      'any.required': 'MONGO_URI es obligatoria',
    }),
});
