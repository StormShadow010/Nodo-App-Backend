# Registro de decisiones técnicas

Cada entrada explica qué se decidió, por qué y qué alternativas se descartaron.

---

## 001 — NestJS + MongoDB para el backend

- **Decisión:** backend en NestJS con MongoDB Atlas, usando Mongoose como ODM.
- **Por qué:**
  - Nest impone una arquitectura modular (módulos, controllers, services) e incluye
    inyección de dependencias, lo que mantiene el código organizado a medida que crece.
  - Nest trae soporte nativo para WebSockets, necesario para la ubicación en vivo.
  - MongoDB tiene consultas geoespaciales nativas (índice `2dsphere`) para fotos y reportes
    en el mapa, e índices TTL para datos que deben expirar solos (reportes, posiciones).
- **Alternativa descartada:** Firebase. Era más rápido de montar, pero se prefirió construir
  y entender el backend completo.

## 002 — pnpm como gestor de paquetes

- **Decisión:** usar pnpm en lugar de npm.
- **Por qué:** instalaciones más rápidas y menor uso de disco.
- **Nota de seguridad:** pnpm bloquea por defecto los scripts que los paquetes ejecutan al
  instalarse, una protección contra ataques a la cadena de suministro. Se aprobaron
  explícitamente solo dos:
  - `@parcel/watcher`: vigilancia de archivos para el modo `--watch`.
  - `unrs-resolver`: resolución de imports usada por el linter.
- **Regla:** no mezclar npm y pnpm. El archivo de bloqueo oficial es `pnpm-lock.yaml`.

## 003 — CommonJS en lugar de ESM

- **Decisión:** el proyecto usa módulos CommonJS.
- **Por qué:** la documentación y el ecosistema de Nest asumen CommonJS. ESM añade fricción
  (extensiones `.js` en los imports, configuración extra de Jest) sin aportar beneficios
  a este proyecto.

## 004 — Validación de variables de entorno con Joi

- **Decisión:** el `.env` se valida al arrancar; si falta una variable obligatoria o tiene
  un formato inválido, la aplicación no inicia.
- **Por qué:** un error de configuración se detecta de inmediato y con un mensaje claro,
  en lugar de aparecer en medio de una petición.
- **Reglas actuales:** `MONGO_URI` obligatoria y con formato `mongodb://` o `mongodb+srv://`;
  `PORT` numérico (3000 por defecto); `NODE_ENV` limitado a `development`, `production` o `test`.

## 005 — `MongooseModule.forRootAsync` en lugar de `forRoot`

- **Decisión:** la conexión a MongoDB se configura con `forRootAsync`, inyectando `ConfigService`.
- **Por qué:** así la URI se lee después de que el `ConfigModule` cargó y validó las variables.
  Con `forRoot` y `process.env` directo, la conexión podría intentarse sin validación previa.
- **Nota:** la conexión se configura una sola vez en el módulo raíz. Cada módulo de negocio
  solo registra sus esquemas con `MongooseModule.forFeature`.

## 006 — Health check con @nestjs/terminus

- **Decisión:** exponer `GET /api/v1/health`, que hace ping a MongoDB con un timeout de 1,5 s.
- **Por qué:** los servicios de despliegue (como Render) consultan esta ruta para saber si la
  app está viva. Responder 503 cuando la base no responde permite detectar que el servidor
  "está arriba" pero no puede trabajar.
- **Verificado:** con conexión responde 200 (`mongodb: up`); sin internet responde 503
  (`mongodb: down`, timeout excedido).

## 007 — Prefijo global `/api/v1`

- **Decisión:** todas las rutas cuelgan de `/api/v1`.
- **Por qué:**
  - `api/` separa las rutas de la API de cualquier otro contenido que el servidor sirva
    en el futuro.
  - `v1` permite publicar una `v2` con cambios incompatibles sin romper las versiones
    instaladas de la app móvil.
