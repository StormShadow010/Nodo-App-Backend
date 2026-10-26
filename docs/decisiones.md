# Registro de decisiones técnicas

Cada entrada explica qué se decidió y por qué.

## 001 — NestJS + MongoDB para el backend

- **Decisión:** backend en NestJS con MongoDB Atlas (Mongoose como ODM).
- **Por qué:** Nest impone una arquitectura modular (módulos, controllers, services) e incluye
  inyección de dependencias y soporte nativo para WebSockets, necesario para la ubicación en vivo.
  MongoDB tiene consultas geoespaciales nativas (índice 2dsphere) e índices TTL para datos que expiran.
- **Alternativa descartada:** Firebase. Era más rápido de montar, pero se quería construir y entender
  el backend completo.

## 002 — pnpm como gestor de paquetes

- **Por qué:** más rápido y eficiente en disco que npm.
- **Nota de seguridad:** pnpm bloquea los scripts de instalación por defecto (protección contra
  ataques a la cadena de suministro). Se aprobaron explícitamente `@parcel/watcher` (vigilancia
  de archivos para el modo watch) y `unrs-resolver` (resolución de imports para el linter).

## 003 — CommonJS en lugar de ESM

- **Por qué:** la documentación y el ecosistema de Nest asumen CommonJS; ESM añade fricción
  (extensiones .js en imports, configuración de Jest) sin beneficio para este proyecto.

## 004 — Validación de variables de entorno con Joi

- **Decisión:** la app valida el `.env` al arrancar y se niega a iniciar si falta algo.
- **Por qué:** un error de configuración se detecta de inmediato y con un mensaje claro,
  no en medio de una petición.

## 005 — `MongooseModule.forRootAsync` en lugar de `forRoot`

- **Por qué:** `forRootAsync` permite inyectar el `ConfigService`, así la URI se lee ya validada.
  Con `forRoot` y `process.env` directo, la conexión podría intentarse antes de validar las variables.
