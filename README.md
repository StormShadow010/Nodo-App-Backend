# nodo-api

Backend de una app móvil de viajes grupales. Familias y amigos que se desplazan en varios
vehículos (carro o moto) ven en un mismo mapa la ubicación en vivo de cada integrante,
el rastro de su recorrido, reportes rápidos del grupo (tráfico, accidentes, paradas, retenes)
y fotos geolocalizadas de los lugares por donde pasan.

El frontend es una app en Ionic + Angular + Capacitor (repositorio aparte).

## Tecnologías

- **NestJS** (TypeScript, CommonJS)
- **MongoDB Atlas** con **Mongoose**
- **@nestjs/config + Joi** para variables de entorno validadas
- **@nestjs/terminus** para el health check
- **pnpm** como gestor de paquetes

## Requisitos

- Node.js 20 o superior
- pnpm
- Un cluster en MongoDB Atlas (o MongoDB local)

## Instalación

```bash
pnpm install
cp .env.example .env   # luego completa MONGO_URI
```

> Si pnpm muestra el aviso de _build scripts_ ignorados, ejecuta `pnpm approve-builds`
> (ver la decisión 002 en `docs/decisiones.md`).

## Ejecución

```bash
pnpm start:dev    # desarrollo, con recarga automática
pnpm build        # compila a dist/
pnpm start:prod   # ejecuta la versión compilada
```

## Variables de entorno

| Variable    | Obligatoria | Descripción                                             |
| ----------- | ----------- | ------------------------------------------------------- |
| `PORT`      | No (3000)   | Puerto HTTP                                             |
| `NODE_ENV`  | No          | `development`, `production` o `test`                    |
| `MONGO_URI` | Sí          | Cadena de conexión de MongoDB, con el nombre de la base |

La app valida estas variables al arrancar y **no inicia** si falta alguna obligatoria
o tiene un formato inválido.

## Estructura

```
src/
  main.ts                 → arranque, prefijo global /api/v1
  app.module.ts           → módulo raíz: config, conexión a MongoDB y módulos
  config/
    env.validation.ts     → esquema Joi de las variables de entorno
  modules/
    health/               → health check (estado del servidor y de MongoDB)
docs/
  decisiones.md           → registro de decisiones técnicas
```

## Endpoints

Base: `http://localhost:3000/api/v1`

| Método | Ruta      | Descripción                                                                         |
| ------ | --------- | ----------------------------------------------------------------------------------- |
| GET    | `/health` | Estado del servidor y de MongoDB. 200 si todo está bien, 503 si la base no responde |

## Documentación

- Decisiones técnicas: [docs/decisiones.md](docs/decisiones.md)

## Convención de commits

Se usa [Conventional Commits](https://www.conventionalcommits.org/):
`feat:` funcionalidad · `fix:` corrección · `docs:` documentación · `chore:` configuración y dependencias.
