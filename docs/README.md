# Skeleton Project v1

> Django REST Framework · Vite + React + TypeScript · PostgreSQL · Nginx
> Todo gestionado con Docker y Docker Compose.

---

## Estructura del proyecto

```
fullstack-skeleton/
├── backend/                    # Django + DRF
│   ├── apps/
│   │   ├── core/               # Health-check y utilidades base
│   │   └── users/              # Modelo User personalizado + endpoint /me/
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py         # Configuración compartida
│   │   │   ├── development.py  # Dev overrides
│   │   │   └── production.py   # Prod overrides
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   └── Dockerfile
├── frontend/                   # Vite + React + TypeScript
│   ├── src/
│   │   ├── pages/
│   │   ├── services/api.ts     # Axios preconfigurado con CSRF
│   │   └── ...
│   ├── Dockerfile              # Multi-stage: dev / build / production
│   └── vite.config.ts
├── nginx/
│   ├── conf.d/default.conf     # Proxy inverso: /api → backend, / → frontend
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Primeros pasos (< 5 minutos)

```bash
# 1. Clonar
git clone <repo-url> myproject && cd myproject

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env: cambiar DJANGO_SECRET_KEY, DB_PASSWORD, etc.

# 3. Configurar docker-compose
cp docker-compose.example.yml docker-compose.yml
# Editar docker-compose.yml si necesitas ajustes de servicios/red/volúmenes

# 4. Construir imágenes
docker compose build --no-cache

# 5. Levantar servicios
docker compose up -d

# 6. Migraciones y superusuario
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

---

## URLs disponibles

| Servicio       | URL                         |
|----------------|-----------------------------|
| Frontend       | http://localhost            |
| API REST       | http://localhost/api/       |
| Health Check   | http://localhost/api/health/|
| Django Admin   | http://localhost/admin/     |
| Archivos media | http://localhost/media/     |

---

## Variables de entorno (.env)

| Variable                     | Descripción                                  | Ejemplo                  |
|------------------------------|----------------------------------------------|--------------------------|
| `COMPOSE_PROJECT_NAME`       | Prefijo de los contenedores                  | `myproject`              |
| `POSTGRES_DB`                | Nombre de la base de datos                   | `myproject_db`           |
| `POSTGRES_USER`              | Usuario de PostgreSQL                        | `myproject_user`         |
| `POSTGRES_PASSWORD`          | Contraseña de PostgreSQL                     | `strongpassword`         |
| `DJANGO_SECRET_KEY`          | Clave secreta de Django                      | (generá una aleatoria)   |
| `DJANGO_ENV`                 | Entorno (`development` / `production`)       | `development`            |
| `DJANGO_DEBUG`               | Activar modo debug                           | `True`                   |
| `DJANGO_ALLOWED_HOSTS`       | Hosts permitidos (separados por coma)        | `localhost,127.0.0.1`    |
| `DJANGO_CORS_ALLOWED_ORIGINS`| Orígenes CORS (separados por coma)           | `http://localhost`       |
| `GUNICORN_WORKERS`           | Número de workers de Gunicorn                | `2`                      |
| `FRONTEND_TARGET`            | Stage del Dockerfile del frontend            | `development`            |
| `VITE_API_BASE_URL`          | Base URL de la API para Axios                | `http://localhost/api`   |
| `NGINX_HTTP_PORT`            | Puerto HTTP del host                         | `80`                     |

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Logs de un servicio específico
docker compose logs -f backend

# Correr shell de Django
docker compose exec backend python manage.py shell

# Correr tests
docker compose exec backend python manage.py test

# Makemigrations para una app
docker compose exec backend python manage.py makemigrations users

# Detener servicios
docker compose down

# Detener y borrar volúmenes (⚠️ borra la DB)
docker compose down -v
```

---

## Arquitectura de red

```
Browser
   │
   ▼
[Nginx :80]
   ├── /api/*    ──► [backend:8000]  (Django / DRF)
   ├── /admin/*  ──► [backend:8000]
   ├── /static/  ──► volumen static_files
   ├── /media/   ──► volumen media_files
   └── /*        ──► [frontend:5173] (Vite dev server)
                         │
                    [db:5432] (PostgreSQL)  ◄── [backend]
```

Dos redes Docker internas:
- **backend_net**: `db` ↔ `backend` (la DB nunca es accesible desde el exterior)
- **proxy_net**: `nginx` ↔ `backend` ↔ `frontend`

---

## Pasar a producción

1. En `.env` setear `DJANGO_ENV=production`, `DJANGO_DEBUG=False`, `FRONTEND_TARGET=production`
2. Generar un `DJANGO_SECRET_KEY` fuerte
3. Actualizar `DJANGO_ALLOWED_HOSTS` con el dominio real
4. `docker compose build --no-cache && docker compose up -d`

---

## Agregar una nueva app Django

```bash
docker compose exec backend python manage.py startapp nombre_app apps/nombre_app
```

Luego agregar `"apps.nombre_app"` en `LOCAL_APPS` dentro de `config/settings/base.py`.
