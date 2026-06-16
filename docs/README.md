# Skeleton Project - Sistema Web Base

Un **skeleton project** listo para usar como base de sistemas web modernos. Incluye una arquitectura dockerizada con servicios independientes (base de datos, backend API y frontend) que pueden ser escalados y adaptados según las necesidades del proyecto.

## 📋 Estructura del Proyecto

```
skeleton-project-v1/
├── backend/                  # API REST con Django
│   ├── Dockerfile           # Configuración de Docker para backend
│   ├── requirements.txt      # Dependencias de Python
│   └── ... (código Django)
├── frontend/                 # Aplicación frontend (Node.js)
│   ├── Dockerfile           # Configuración de Docker para frontend
│   └── ... (código Node.js/React)
├── docker compose.yml       # Orquestación de servicios
├── .env.example             # Variables de entorno de ejemplo
├── .gitignore               # Archivos ignorados por Git
└── README.md                # Este archivo
```

## 🏗️ Arquitectura

El proyecto utiliza **Docker Compose** para orquestar tres servicios principales:

### 1. **Base de Datos (PostgreSQL)**
- **Puerto:** 5432 (interno)
- **Imagen:** postgres:16
- **Rol:** Almacenamiento de datos persistente
- **Volumen:** `postgres_data` (para persistencia de datos)

### 2. **Backend (Django REST Framework)**
- **Puerto:** 8080
- **Framework:** Django 5.0 + Django REST Framework
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT (djangorestframework-simplejwt)
- **CORS:** Habilitado para comunicación con frontend

### 3. **Frontend (Node.js)**
- **Puerto:** 5173 (Vite development server)
- **Runtime:** Node.js 25.9
- **Build Tool:** Vite (por defecto)
- **Hot Reload:** Habilitado para desarrollo

### 4. **Nginx (Reverse Proxy)**
- **Puerto:** 8888 (punto de entrada público)
- **Rol:** Reverse proxy centralizado
- **Funcionalidad:**
  - Redirige tráfico `/api/*` → Backend (puerto 8080)
  - Redirige tráfico `/` → Frontend (puerto 5173)
  - Mantiene headers de cliente (IP real, protocolo, etc)
  - Soporta HMR (Hot Module Reload) para desarrollo

## 🚀 Requisitos Previos

Asegúrate de tener instalado:

- **Docker** (versión 20.10+)
- **Docker Compose** (versión 2.0+)
- **Git** (para clonar el proyecto)

Verifica la instalación:
```bash
docker --version
docker compose --version
```

## ⚙️ Configuración Inicial

### Paso 1: Obtener el Proyecto

```bash
# Opción A: Clonar desde repositorio
git clone <URL_DEL_REPOSITORIO> mi-proyecto
cd mi-proyecto

# Opción B: Usar como plantilla
# Usar el botón "Use this template" en GitHub
```

### Paso 2: Configurar Variables de Entorno

Crear el archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

⚠️ **IMPORTANTE:** Cambiar `SECRET_KEY` y `DB_PASSWORD` por valores seguros y únicos.

### Paso 3: Contrucción de las imagenes

Constriccion de las imagenes de los contenedores:
```bash
docker compose build --no-cache
```

## 🛠️ Inicializar Backend (Django REST Framework)

### Paso 1: Crear Proyecto Django

Si el directorio `backend/` está vacío, necesitas crear un nuevo proyecto Django:

```bash
docker compose run --rm backend python -m django startproject config .
```

Este comando crea:
- `manage.py` - Script de administración de Django
- `config/` - Carpeta de configuración del proyecto

### Paso 2: Actualizar Configuración de Django

Editar `backend/config/settings.py` para configurar la base de datos y los servicios:

```python
# Agregar INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',                    # Django REST Framework
    'rest_framework_simplejwt',          # JWT Authentication
    'corsheaders',                       # CORS
    # Aquí van tus apps personalizadas
    # 'apps.users',
    # 'apps.products',
]

# Configurar CORS
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',           # Agregar esta línea
    'django.middleware.common.CommonMiddleware',
    # ... resto de middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",      # Frontend local
    "http://127.0.0.1:5173",
]

# Configurar Base de Datos PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'db_name'),
        'USER': os.getenv('DB_USER', 'db_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'finance_secure_password'),
        'HOST': os.getenv('DB_HOST', 'db'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Configurar REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# Permitir peticiones desde cualquier origen en desarrollo
# ⚠️ Cambiar en producción
ALLOWED_HOSTS = ['*']
```

## 🎨 Inicializar Frontend (Vite)

**⚠️ IMPORTANTE:** Este paso debe ejecutarse ANTES de levantar los servicios con `docker compose up -d`

### Paso 1: Crear Proyecto Vite

Si el directorio `frontend/src` está vacío, crear un nuevo proyecto Vite:

```bash
docker compose run --rm frontend npm create vite@latest .
```
### Paso 2: Actualizar Configuración de Vite

**CRÍTICO PARA DOCKER**
- Escucha en **todas las interfaces de red** (no solo localhost)
- En Docker, el frontend necesita ser accesible desde afuera del contenedor
- Sin esto: ❌ El frontend no sería visible en `http://localhost:5173`
- Con esto: ✅ Es visible desde el navegador del host

**frontend/vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://nginx:8888',
        changeOrigin: true,
      },
    },
  },
})
```

### Paso 3: Estructura Recomendada - Frontend

```
frontend/src/
├── main.jsx                 # Punto de entrada
├── App.jsx                  # Componente raíz
├── components/              # Componentes reutilizables
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── ...
├── pages/                   # Páginas
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   └── ...
├── services/                # Servicios API
│   ├── api.js              # Configuración axios
│   ├── userService.js
│   └── ...
├── hooks/                   # Custom hooks
├── context/                 # Context API
├── assets/                  # Imágenes, iconos, fuentes
└── utils/                   # Utilidades
```

### Paso 4: Instalar Dependencias Frontend

```bash
# Instalar todas las dependencias
docker compose exec frontend npm install

# Instalar nuevos paquetes
docker compose exec frontend npm install react-router-dom

# Instalar como dependencia de desarrollo
docker compose exec frontend npm install --save-dev <nombre-paquete>

# Verificar paquetes instalados
docker compose exec frontend npm list
```

### Paso 5: Configurar Comunicación Backend-Frontend

**frontend/src/services/api.js:**
```javascript
const API_BASE_URL = 'http://localhost:8888/api';

async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }

    return response.json();
}

export default apiCall;

// Uso:
// const users = await apiCall('/users');
// const user = await apiCall('/users/1');
// const newUser = await apiCall('/users', { method: 'POST', body: JSON.stringify({name: 'John'}) });
```

---

## ⚙️ Configurar Nginx

### Estructura de Nginx

```
nginx/
├── Dockerfile              # Imagen Nginx personalizada
└── conf.d/
    └── default.conf        # Configuración de reverse proxy
```

### Puntos de Entrada

- **Desarrollo local:** `http://localhost:8888`
- **Frontend:** `http://localhost:8888/` (proxeado desde Vite)
- **API Backend:** `http://localhost:8888/api/` (proxeado desde Django)

### Modificar Configuración de Nginx

Editar `nginx/conf.d/default.conf` para cambiar rutas, headers o comportamientos del proxy.

**Validar sintaxis después de cambios:**
```bash
docker compose exec nginx nginx -t
docker compose restart nginx
```

---

## 🏗️ Estructura Recomendada - Backend

**Clean Architecture + Vertical Slicing:**

```
backend/
├── manage.py
├── requirements.txt
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── apps/                           # Módulos autónomos por feature
│   ├── users/
│   │   ├── domain/                 # Lógica pura (entities.py, repositories.py)
│   │   ├── application/            # Casos de uso (use_cases.py, dtos.py)
│   │   └── infrastructure/         # Implementación (models.py, views.py, serializers.py)
│   ├── products/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── ...
├── shared/                         # Código compartido
│   ├── domain/
│   ├── application/
│   └── infrastructure/
└── tests/                          # Tests paralelos a apps/
    ├── users/
    ├── products/
    └── integration/
```

### Crear Primera App

```bash
docker compose run --rm backend python manage.py startapp users apps/users
docker compose run --rm backend python manage.py startapp products apps/products
```

---

## 🎬 Gestión de Servicios

### Levantar Servicios

```bash
# Levantar todos los servicios en background
docker compose up -d

# Levantar con reconstrucción de imágenes
docker compose up -d --build

# Levantar sin cache
docker compose build --no-cache && docker compose up -d

# Ver logs en tiempo real
docker compose logs -f
```

### Detener y Reiniciar

```bash
# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (⚠️ borra datos de BD)
docker compose down -v

# Reiniciar un servicio específico
docker compose restart backend
docker compose restart frontend
docker compose restart nginx
docker compose restart db
```

### Ver Estado y Logs

```bash
# Ver estado de todos los contenedores
docker compose ps

# Ver logs de un servicio específico (últimas líneas)
docker compose logs backend
docker compose logs frontend
docker compose logs nginx
docker compose logs db

# Ver logs en vivo (con -f)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

---

## 🔧 Comandos Backend (Django)

### Instalar Dependencias

```bash
# Instalar todas las dependencias
docker compose exec backend pip install -r requirements.txt

# Instalar nueva dependencia
docker compose exec backend pip install <nombre-paquete>

# Actualizar requirements.txt
docker compose exec backend pip freeze > requirements.txt

# Ver paquetes instalados
docker compose exec backend pip list
```

### Migraciones de Base de Datos

```bash
# Crear migraciones de modelos nuevos/modificados
docker compose exec backend python manage.py makemigrations

# Ejecutar migraciones
docker compose exec backend python manage.py migrate

# Ver estado de migraciones
docker compose exec backend python manage.py showmigrations
```

### Gestión de Admin

```bash
# Crear superusuario (admin)
docker compose exec backend python manage.py createsuperuser

# Cambiar contraseña de usuario
docker compose exec backend python manage.py changepassword <usuario>
```

### Testing en Backend

```bash
# Ejecutar todos los tests
docker compose exec backend python -m unittest discover -s tests

# Ejecutar tests de un módulo específico
docker compose exec backend python -m unittest tests.users

# Ejecutar con output verboso
docker compose exec backend python -m unittest discover -s tests -v

# Ejecutar un archivo de tests específico
docker compose exec backend python -m unittest tests.users.test_entities

# Ejecutar un test case específico
docker compose exec backend python -m unittest tests.users.test_entities.UserEntityTest.test_creation
```

### Crear Apps

```bash
# Crear nueva app
docker compose exec backend python manage.py startapp users apps/users
docker compose exec backend python manage.py startapp products apps/products
```

### Otros Comandos Útiles

```bash
# Shell interactivo de Django
docker compose exec backend python manage.py shell

# Ejecutar comando customizado
docker compose exec backend python manage.py <comando>
```

---

## 🎨 Comandos Frontend (Node.js)

### Instalar Dependencias

```bash
# Instalar todas las dependencias
docker compose exec frontend npm install

# Instalar nuevo paquete
docker compose exec frontend npm install <nombre-paquete>

# Instalar como dependencia de desarrollo
docker compose exec frontend npm install --save-dev <nombre-paquete>

# Ver paquetes instalados
docker compose exec frontend npm list
```

### Build y Desarrollo

```bash
# Build para producción
docker compose exec frontend npm run build

# Ver scripts disponibles
docker compose exec frontend npm run

# Ejecutar script personalizado
docker compose exec frontend npm run <script-name>
```

---

## 📂 Resumen de Estructuras

### Backend

```
backend/
├── manage.py
├── requirements.txt
├── config/
│   ├── settings.py, urls.py, asgi.py, wsgi.py
├── apps/                    # Módulos por feature
│   ├── users/
│   │   ├── domain/         # Lógica pura
│   │   ├── application/    # Casos de uso
│   │   └── infrastructure/ # Modelos, views, serializers
│   └── products/
├── shared/                  # Código compartido
└── tests/                   # Tests paralelos a apps/
```

### Frontend

```
frontend/
├── package.json, vite.config.ts
├── src/
│   ├── main.jsx
│   ├── components/          # Componentes reutilizables
│   ├── pages/              # Páginas
│   ├── services/           # API clients
│   ├── hooks/              # Custom hooks
│   ├── context/            # Context API
│   └── assets/             # Imágenes, fonts
```

---

## ✅ Acceso a los Servicios

| Servicio | URL |
|----------|-----|
| **Nginx (Punto de entrada)** | http://localhost:8888 |
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8080/api |
| **Admin Django** | http://localhost:8080/admin |
| **Base de Datos** | localhost:5432 |

---

## 🚀 Checklist Rápido

1. ✅ Configurar `.env` con valores únicos (`SECRET_KEY`, `DB_PASSWORD`)
2. ✅ `docker compose build --no-cache`
3. ✅ Inicializar Backend: `docker compose run --rm backend python -m django startproject config .`
4. ✅ Configurar `settings.py` (BD, CORS, INSTALLED_APPS)
5. ✅ Inicializar Frontend: `docker compose run --rm frontend npm create vite@latest .`
6. ✅ Configurar `vite.config.ts` (host, proxy a Nginx)
7. ✅ `docker compose up -d`
8. ✅ `docker compose exec backend python manage.py migrate`
9. ✅ `docker compose exec backend python manage.py createsuperuser`
10. ✅ Acceder a http://localhost:8888 (Nginx)

---
