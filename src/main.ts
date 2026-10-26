import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // main.ts no tiene constructor, así que se pide el ConfigService al contenedor de Nest
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);
  const env = config.get<string>('NODE_ENV');
  const isProduction = env === 'production';
  // Todas las rutas quedan bajo /api/v1 (ej: /api/v1/health)
  app.setGlobalPrefix('api/v1');

  /**
   * Cabeceras de seguridad HTTP.
   * Fuera de producción se desactiva la Content-Security-Policy
   * porque bloquea los scripts de la interfaz de Swagger.
   */
  app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }));

  /**
   * CORS: permite peticiones desde otros orígenes (la app Ionic).
   * Abierto mientras se desarrolla; antes de producción se debe
   * restringir a los orígenes de la app.
   */
  app.enableCors();

  /**
   * Validación global de los datos de entrada usando los DTOs.
   * - whitelist: elimina campos que no estén declarados en el DTO.
   * - forbidNonWhitelisted: si llegan campos extra, responde 400 en vez de ignorarlos.
   * - transform: convierte el body en una instancia del DTO y los tipos (ej: "5" → 5).
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentación interactiva de la API: solo fuera de producción
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Nodo API')
      .setDescription(
        'Backend de viajes grupales: ubicación en vivo, rastro, reportes y fotos',
      )
      .setVersion('1.0')
      .addBearerAuth() // prepara el botón "Authorize" para el JWT que vendrá con auth
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);
  Logger.log(`Servidor en http://localhost:${port} [${env}]`, 'Bootstrap');
  if (!isProduction) {
    Logger.log(`Documentación en http://localhost:${port}/docs`, 'Bootstrap');
  }
}
void bootstrap();
