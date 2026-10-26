import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // main.ts no tiene constructor, así que se pide el ConfigService al contenedor de Nest
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);
  const env = config.get<string>('NODE_ENV');
  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Servidor en http://localhost:${port} [${env}]`, 'Bootstrap');
}
void bootstrap();
