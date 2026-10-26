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
- **Problema encontrado:** al instalar `class-validator` y `class-transformer` (dependencias
  opcionales de `@nestjs/common`), pnpm creó dos copias de `@nestjs/common` y TypeScript
  marcó tipos incompatibles. Se resolvió con `pnpm dedupe`. Ejecutarlo después de agregar
  paquetes que sean dependencias opcionales de otros.
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

## 008 — Validación global de datos de entrada (ValidationPipe)

- **Decisión:** `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`.
- **Por qué:**
  - Cada endpoint valida su entrada con un DTO (class-validator), sin código manual.
  - `whitelist` + `forbidNonWhitelisted` rechazan con 400 los campos no declarados en el DTO.
    Evita, por ejemplo, que un cliente envíe `role: "admin"` al registrarse (asignación masiva),
    y ayuda a detectar errores del frontend como campos mal escritos.
  - `transform` convierte el body en una instancia del DTO y ajusta los tipos.
- **Por qué los DTO son clases y no interfaces:** las interfaces desaparecen al compilar a
  JavaScript. Las clases existen en tiempo de ejecución y guardan los decoradores como
  metadatos, que el `ValidationPipe` lee para validar.
- **Reemplaza:** la validación manual (`requireString`, etc.) de la base Express.

## 009 — Cabeceras de seguridad con Helmet y CORS

- **Decisión:** Helmet activo en todos los entornos; CORS abierto durante el desarrollo.
- **Por qué:** Helmet añade cabeceras que mitigan ataques comunes (clickjacking, sniffing de
  tipo MIME, etc.). CORS abierto facilita probar desde la app Ionic en desarrollo.
- **Pendiente antes de producción:** restringir CORS a los orígenes de la app
  (`http://localhost` en Android y `capacitor://localhost` en iOS).
- **Nota:** fuera de producción se desactiva la Content-Security-Policy de Helmet,
  porque bloquea los scripts de la interfaz de Swagger.

## 010 — Swagger solo fuera de producción

- **Decisión:** la documentación interactiva se publica en `/docs` únicamente si
  `NODE_ENV` no es `production`.
- **Por qué:** la documentación se genera desde el código y siempre está actualizada, pero
  en producción expondría el mapa completo de la API.

## 011 — Separación de módulos `users` y `auth`

- **Decisión:** `users` solo accede a los datos; `auth` contiene registro, login y tokens.
- **Por qué:** cada módulo tiene una sola responsabilidad. `UsersModule` exporta su servicio
  y `AuthModule` lo importa, sin duplicar el acceso a la base.

## 012 — Contraseñas cifradas con bcryptjs

- **Decisión:** se guarda solo el hash (10 rondas de sal), nunca la contraseña.
- **Por qué bcryptjs y no bcrypt:** es JavaScript puro; no compila código nativo, lo que evita
  problemas en Windows y con los bloqueos de build scripts de pnpm.
- **Formato del hash:** `$2b$10$` + sal (22 caracteres) + hash (31 caracteres). La sal viaja
  dentro del hash, por eso no se guarda aparte, y dos usuarios con la misma contraseña tienen
  hashes distintos.
- **Límite:** bcrypt usa solo los primeros 72 bytes. El DTO limita a 72 caracteres; con tildes
  o ñ (2 bytes) una contraseña larga podría superar ese límite. Aceptado para este proyecto.

## 013 — La contraseña nunca sale de la base por defecto

- **Decisión:** el campo `password` tiene `select: false`.
- **Por qué:** ninguna consulta la devuelve por accidente. Solo el login la pide de forma
  explícita con `select('+password')`.
- **Nota:** `select: false` no aplica a lo que devuelve `create()`, por eso el servicio vuelve
  a consultar el usuario antes de retornarlo.

## 014 — Validación en dos capas y correos duplicados

- **DTO:** valida la entrada HTTP y responde 400 con mensajes claros.
- **Esquema:** última barrera; protege la base aunque el dato llegue por otro camino.
- **Correos repetidos:** el servicio normaliza el correo (`trim` + minúsculas) antes de buscar,
  y verifica antes de crear (409). Si dos registros llegan al mismo tiempo, ambos pasarían esa
  verificación, pero el índice `unique` de MongoDB solo deja insertar uno.
