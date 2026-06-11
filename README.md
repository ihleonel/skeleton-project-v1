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

**Archivo `.env` (valores por defecto):**
```env
SECRET_KEY=26qt^hayq@lv&&e$4kgb5@b*@9@a1z580dmg-%!_@$^kas=!*-

# Configuración de Base de Datos
DB_HOST=db
DB_NAME=db_name
DB_USER=db_user
DB_PASSWORD=db_secure_password
DB_PORT=5432
```

⚠️ **Para producción:** Cambiar `SECRET_KEY` y `DB_PASSWORD` por valores seguros y únicos.

## 🛠️ Inicializar Backend (Django REST Framework)

**⚠️ IMPORTANTE:** Constriccion de las imagenes de los contenedores con `docker compose build --no-cache`

### Paso 1: Crear Proyecto Django

Si el directorio `backend/` está vacío, necesitas crear un nuevo proyecto Django:

```bash
# Crear proyecto Django dentro del contenedor
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

### Paso 3: Crear Estructura de Directorios (Recomendado)

Estructura recomendada (Clean Architecture + Vertical Slicing):
```
backend/
├── manage.py
├── requirements.txt
├── Dockerfile
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── apps/                           # Vertical Slicing - módulos autónomos
│   ├── users/                      # Feature: Gestión de Usuarios
│   │   ├── domain/                 # Capa: Lógica pura del negocio
│   │   │   ├── entities.py         # Entidades (dataclass)
│   │   │   ├── repositories.py     # Interfaces (ABC)
│   │   │   └── exceptions.py       # Excepciones de dominio
│   │   ├── application/            # Capa: Casos de uso
│   │   │   ├── use_cases.py        # RegisterUser, LoginUser, etc.
│   │   │   ├── dtos.py             # Data Transfer Objects
│   │   │   └── services.py         # Orquestación de lógica
│   │   └── infrastructure/         # Capa: Implementación técnica
│   │       ├── models.py           # Modelos Django ORM
│   │       ├── repositories.py     # Implementación de repo
│   │       ├── views.py            # Vistas REST (DRF)
│   │       ├── serializers.py      # Serializadores
│   │       ├── urls.py             # Rutas del módulo
│   │       └── migrations/         # Migraciones
│   │
│   ├── products/                   # Feature: Gestión de Productos
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   │
│   └── ...
│
├── shared/                         # Código compartido entre módulos
│   ├── domain/                     # Base classes y interfaces
│   │   └── repository.py           # Interface base para repositorios
│   ├── application/                # Utilidades de aplicación
│   └── infrastructure/             # Utilidades compartidas
│
└── tests/                          # Tests - estructura paralela a apps/
    ├── users/                      # Tests de Feature: Usuarios
    │   ├── test_entities.py
    │   ├── test_use_cases.py
    │   └── test_repositories.py
    ├── products/                   # Tests de Feature: Productos
    │   ├── test_entities.py
    │   ├── test_use_cases.py
    │   └── test_repositories.py
    ├── shared/                     # Tests del código compartido
    └── integration/                # Tests de integración
```

### Paso 4: Crear tu Primera App (Opcional)

```bash
# Crear una app dentro del contenedor (ej: usuarios)
docker compose run --rm backend python manage.py startapp users apps/users

# O para otra app
docker compose run --rm backend python manage.py startapp products apps/products
```

### Ejemplo: Crear API REST Simple

**backend/apps/users/models.py:**
```python
from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
```

**backend/apps/users/serializers.py:**
```python
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']
```

**backend/apps/users/views.py:**
```python
from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
```

**backend/apps/users/urls.py:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

**backend/config/urls.py:**
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
]
```

## 🎨 Inicializar Frontend (Vite)

**⚠️ IMPORTANTE:** Este paso debe ejecutarse ANTES de levantar los servicios con `docker compose up -d`

### Paso 1: Crear Proyecto Vite

Si el directorio `frontend/src` está vacío, crear un nuevo proyecto Vite:

```bash
# Crear proyecto Vite con TypeScript (RECOMENDADO)
docker-compose run --rm frontend npm create vite@latest . -- --template react-ts
```

> ⚠️ **Se recomienda `react-ts` (TypeScript)** para mejor integración con el `vite.config.ts` que configurarás después. Si prefieres JavaScript puro, usa `--template react`.

**Opciones de template disponibles:**
- `react` - React con JSX
- `react-ts` - React con TypeScript ⭐ **RECOMENDADO**
- `vue` - Vue 3
- `vue-ts` - Vue 3 con TypeScript
- `preact` - Preact
- `vanilla` - JavaScript vanilla
- `svelte` - Svelte

### Paso 2: Instalar Dependencias

```bash
# Instalar todas las dependencias
docker-compose exec frontend npm install

# Las dependencias de desarrollo necesarias para la configuración de Vite ya vienen incluidas
# Si las necesitas instalar manualmente:
# docker-compose exec frontend npm install --save-dev vite @vitejs/plugin-react

# Instalar paquetes adicionales (opcionales)
docker-compose exec frontend npm install axios react-router-dom
```

### Paso 3: Estructura Recomendada de Proyecto

```
frontend/src/
├── main.jsx                 # Punto de entrada
├── App.jsx                  # Componente raíz
├── App.css
├── index.css
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Navbar.jsx
│   └── ...
├── pages/
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   └── ...
├── services/
│   ├── api.js              # Configuración de axios
│   ├── userService.js      # Llamadas a API de usuarios
│   ├── productService.js   # Llamadas a API de productos
│   └── ...
├── hooks/
│   ├── useAuth.js
│   ├── useFetch.js
│   └── ...
├── context/
│   ├── AuthContext.jsx
│   └── ...
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── utils/
    ├── helpers.js
    ├── constants.js
    └── ...
```

### Paso 4: Configurar Comunicación con Backend

**frontend/src/services/api.js:**
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

**frontend/src/services/userService.js:**
```javascript
import api from './api';

const userService = {
    getAll: () => api.get('/users/'),
    getById: (id) => api.get(`/users/${id}/`),
    create: (data) => api.post('/users/', data),
    update: (id, data) => api.put(`/users/${id}/`, data),
    delete: (id) => api.delete(`/users/${id}/`),
};

export default userService;
```

### Paso 5: Crear Componentes React

**frontend/src/App.jsx:**
```javascript
import { useEffect, useState } from 'react';
import userService from './services/userService';
import './App.css';

function App() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll();
            setUsers(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Usuarios</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.username} ({user.email})</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
```

### Paso 6: Configurar Vite para Dev Server

**frontend/vite.config.ts:**
```typescript
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:8080',
        changeOrigin: true,
      },
    },
  },
})
```

#### 📌 Explicación de la Configuración de Vite

Esta configuración es **crítica** para el correcto funcionamiento del frontend en Docker. Veamos cada parte:

##### **1. Plugins**
```typescript
plugins: [react()],
```
- Habilita soporte para React y JSX
- Permite usar características modernas de React

##### **2. Resolve - Path Alias** ⭐ **IMPORTANTE**
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```
**¿Qué hace?**
- Define un alias `@` que apunta a la carpeta `src/`
- Permite importar así: `import Button from '@/components/Button'` en lugar de `import Button from '../../../components/Button'`

**¿Por qué es importante?**
- ✅ Evita imports profundos y confusos
- ✅ Hace el código más legible y mantenible
- ✅ Facilita refactoring (mover archivos sin romper imports)

**Ejemplo de uso:**
```javascript
// ❌ SIN alias (feo y frágil)
import UserService from '../../../../services/userService'
import Button from '../../../components/Button'

// ✅ CON alias (limpio y mantenible)
import UserService from '@/services/userService'
import Button from '@/components/Button'
```

##### **3. Server - Configuración del Dev Server**
```typescript
server: {
  host: '0.0.0.0',
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://backend:8080',
      changeOrigin: true,
    },
  },
},
```

###### **3.1 Host: `0.0.0.0`** ⭐ **CRÍTICO PARA DOCKER**
- Escucha en **todas las interfaces de red** (no solo localhost)
- En Docker, el frontend necesita ser accesible desde afuera del contenedor
- Sin esto: ❌ El frontend no sería visible en `http://localhost:5173`
- Con esto: ✅ Es visible desde el navegador del host

###### **3.2 Port: `5173`**
- Puerto en el que escucha el dev server
- Debe coincidir con el puerto expuesto en `docker-compose.yml` (`ports: - "5173:5173"`)

###### **3.3 Proxy: `/api` → Backend** ⭐ **IMPORTANTE PARA DESARROLLO**
```typescript
proxy: {
  '/api': {
    target: 'http://backend:8080',
    changeOrigin: true,
  },
},
```

**¿Qué hace?**
- Redirige todas las peticiones a `/api/*` al backend en `http://backend:8080/api/*`
- Ejemplo: `http://localhost:5173/api/users/` → `http://backend:8080/api/users/`

**¿Por qué es importante?**

Sin proxy:
```javascript
// ❌ Hay que usar URLs completas
fetch('http://localhost:8080/api/users')
// ❌ Problema en producción: localhost no existe en el servidor
// ❌ CORS issues posibles
```

Con proxy:
```javascript
// ✅ URLs relativas y limpias
fetch('/api/users')
// ✅ Funciona igual en desarrollo y producción
// ✅ Sin problemas de CORS
// ✅ El proxy automáticamente cambia 'changeOrigin: true' para que el backend piense que la petición viene directamente
```

**`changeOrigin: true` explica:**
- Modifica el header `Origin` de la petición
- El backend recibe las peticiones como si vinieran directamente desde el cliente
- Evita problemas de CORS en desarrollo

#### 📌 Resumen de por qué esta configuración es NECESARIA

| Opción | Problema sin ella | Solución |
|--------|------------------|----------|
| `host: '0.0.0.0'` | Frontend no visible desde el navegador | Escucha en todas las interfaces |
| `alias: '@'` | Imports complejos y frágiles | Alias simplifica imports |
| `proxy: '/api'` | Peticiones a localhost (no funciona en Docker) | Proxy redirige al backend |
| `changeOrigin: true` | Posibles errores CORS | Modifica headers correctamente |

---

## 🎬 Levantando los Servicios

Ahora que has inicializado Backend y Frontend, puedes levantar todos los servicios:

### Paso 1: Levantar Todos los Servicios

```bash
# Levantar todos los servicios
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f
```

### Paso 2: Reconstruir Imágenes (después de cambios)

```bash
# Reconstruir y levantar
docker compose up -d --build

# Sin cache
docker compose build --no-cache && docker compose up -d
```

### Paso 3: Verificar Estado

```bash
# Ver estado de todos los contenedores
docker compose ps

# Ver logs de un servicio específico
docker compose logs -f backend    # Backend (Django)
docker compose logs -f frontend   # Frontend (Node.js)
docker compose logs -f db         # Base de datos
```

**Tiempo de inicio:** 30-60 segundos aproximadamente para que todos los servicios estén listos.

## ✅ Configuración Final (Post-Servicios)

Una vez que los servicios estén levantados, ejecuta estos comandos para completar la configuración:

### Paso 1: Ejecutar Migraciones de Django

```bash
# Ejecutar migraciones de Django
docker compose exec backend python manage.py migrate

# Crear superusuario (admin)
docker compose exec backend python manage.py createsuperuser
# Ingresa: usuario, email, contraseña
```

### Paso 2: Crear Migraciones Iniciales (si creaste apps)

```bash
# Crear migración para los modelos
docker compose exec backend python manage.py makemigrations

# Ejecutar las nuevas migraciones
docker compose exec backend python manage.py migrate
```

## 📱 Acceder a los Servicios

Una vez completada la configuración, accede a través de:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación web (Vite dev server) |
| **Backend API** | http://localhost:8080/api | API REST de Django |
| **Admin Django** | http://localhost:8080/admin | Panel administrativo (si está configurado) |
| **Base de Datos** | localhost:5432 | PostgreSQL (conexión interna) |

## 📋 Resumen del Flujo Correcto

1. ✅ **Obtener el proyecto** - Clonar o usar como plantilla
2. ✅ **Configurar variables de entorno** - Crear archivo `.env`
3. ✅ **Inicializar Backend** - Crear proyecto Django y configurar
4. ✅ **Inicializar Frontend** - Crear proyecto Vite e instalar dependencias
5. ✅ **Levantar servicios** - `docker compose up -d`
6. ✅ **Ejecutar migraciones** - Preparar la base de datos
7. ✅ **Crear superusuario** - Acceso al panel admin
8. ✅ **Acceder a las aplicaciones** - Frontend y API listos

## 🔧 Comandos Útiles y Operaciones Comunes

### Gestionar Contenedores

```bash
# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (⚠️ borra datos)
docker compose down -v

# Reiniciar un servicio
docker compose restart backend

# Ver logs en vivo
docker compose logs -f

# Ejecutar comando en un contenedor
docker compose exec backend python manage.py migrate
docker compose exec frontend npm list
```

### Migraciones de Base de Datos

```bash
# Ejecutar migraciones de Django
docker compose exec backend python manage.py migrate

# Crear superusuario
docker compose exec backend python manage.py createsuperuser

# Crear nueva migración
docker compose exec backend python manage.py makemigrations
```

### Gestión del Frontend

```bash
# Instalar nuevas dependencias
docker compose exec frontend npm install <nombre-paquete>

# Ejecutar scripts personalizados
docker compose exec frontend npm run build
```

### Testing en Backend

```bash
# Ejecutar todos los tests
docker compose exec backend python -m unittest discover -s tests

# Ejecutar tests de un módulo específico
docker compose exec backend python -m unittest tests.users

# Ejecutar tests con output verboso
docker compose exec backend python -m unittest discover -s tests -v

# Ejecutar un archivo de tests específico
docker compose exec backend python -m unittest tests.users.test_entities

# Ejecutar un test case específico
docker compose exec backend python -m unittest tests.users.test_entities.UserEntityTest.test_user_creation
```

## 📦 Gestión de Paquetes y Dependencias

### Backend (Python)

```bash
# Instalar nuevas dependencias
docker compose exec backend pip install <nombre-paquete>

# Actualizar requirements.txt después de instalar
docker compose exec backend pip freeze > requirements.txt

# Verificar paquetes instalados
docker compose exec backend pip list
```

### Frontend (Node.js)

```bash
# Instalar nuevas dependencias
docker compose exec frontend npm install <nombre-paquete>

# Instalar dependencias de desarrollo
docker compose exec frontend npm install --save-dev <nombre-paquete>

# Verificar paquetes instalados
docker compose exec frontend npm list
```

## 📂 Estructura de Directorios (Proyecto Completo)

### Backend

```
backend/
├── manage.py               # Script de gestión de Django
├── requirements.txt        # Dependencias Python
├── Dockerfile              # Imagen Docker
├── config/
│   ├── settings.py         # Configuración de Django
│   ├── urls.py             # Rutas principales
│   ├── wsgi.py             # Aplicación WSGI
│   └── asgi.py             # Aplicación ASGI
├── apps/
│   ├── users/              # App de usuarios
│   ├── products/           # App de productos
│   └── ...
├── shared/                 # Código compartido
│   ├── domain/
│   ├── application/
│   └── infrastructure/
└── tests/                  # Tests - estructura paralela a apps/
    ├── users/
    ├── products/
    ├── shared/
    └── integration/
```

### Frontend

```
frontend/
├── package.json            # Configuración de Node.js
├── vite.config.ts          # Configuración de Vite (TypeScript)
├── Dockerfile              # Imagen Docker
├── src/
│   ├── main.jsx           # Punto de entrada
│   ├── App.jsx            # Componente raíz
│   ├── pages/             # Páginas
│   ├── components/        # Componentes reutilizables
│   ├── services/          # Servicios API
│   └── assets/            # Recursos estáticos
├── dist/                  # Build producción (generado)
└── node_modules/          # Dependencias (generado)
```

## 🐛 Solución de Problemas

### El backend no se conecta a la BD

```bash
# Verificar estado del servicio db
docker compose ps db

# Ver logs de la BD
docker compose logs db

# Comprobar healthcheck
docker compose ps

# Reiniciar servicios
docker compose down && docker compose up -d
```

### Puerto ya en uso

```bash
# Encontrar qué proceso usa el puerto (ej: 5173)
lsof -i :5173

# Cambiar puerto en docker compose.yml
# - "5173:5173" → - "3000:5173"
```

### Volumen de datos corrupto

```bash
# Eliminar y recrear volúmenes
docker compose down -v
docker compose up -d
```

## 🔐 Seguridad - Checklist para Producción

- [ ] Cambiar `SECRET_KEY` en `.env`
- [ ] Cambiar `DB_PASSWORD` a una contraseña fuerte
- [ ] Configurar `DEBUG=False` en Django
- [ ] Usar HTTPS (certificados SSL/TLS)
- [ ] Usar reverse proxy (Nginx) para frontend y backend
- [ ] Configurar CORS correctamente
- [ ] Usar variables de entorno para credenciales sensibles
- [ ] Implementar rate limiting
- [ ] Configurar backups de BD automáticos
- [ ] Usar base de datos gestionada (RDS, Cloud SQL, etc.)

## 📦 Dependencias Principales

### Backend
- **Django 5.0.4** - Framework web Python
- **Django REST Framework 3.15** - Herramientas para construir APIs REST
- **djangorestframework-simplejwt** - Autenticación JWT
- **psycopg2-binary** - Adaptador PostgreSQL para Python
- **django-cors-headers** - Soporte para CORS

### Frontend
- **Node.js 25.9** - Runtime JavaScript
- **Vite** - Build tool moderno y rápido

## 🤝 Próximos Pasos

1. **Personalizar:** Cambiar nombres, logos y colores según tu proyecto
2. **Desarrollar:** Crear apps en backend y componentes en frontend
3. **Testear:** Escribir tests unitarios e integración
4. **Documentar:** Usar Swagger/OpenAPI para documentación de API
5. **CI/CD:** Configurar pipelines (GitHub Actions, GitLab CI, etc.)
6. **Deploy:** Desplegar en AWS, Google Cloud, Heroku, Digital Ocean, etc.

## 📚 Recursos Útiles

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Vite Guide](https://vitejs.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 📝 Notas

- Este skeleton está diseñado para **desarrollo local**
- Para **producción**, aplicar todas las consideraciones en la sección de seguridad
- Los datos se persisten en el volumen `postgres_data`
- El frontend incluye **hot-reload** automático durante desarrollo
- El backend requiere reinicio para cambios en `settings.py`

## 📄 Licencia

Este proyecto skeleton está disponible bajo licencia MIT.

---

**¡Listo para empezar!** 🚀 Si necesitas ayuda, revisa la sección de [Solución de Problemas](#-solución-de-problemas).
