# ⛈️ ClimaAlert 2.0 — Sistema de Alertas Meteorológicas & Web Dashboard

Plataforma integral de monitoreo climático y alertas meteorológicas en tiempo real. Utiliza modelos de pronóstico numéricos avanzados (a través de la API gratuita de Open-Meteo), almacena el historial continuo de mediciones y eventos severos en una base de datos **Supabase PostgreSQL**, notifica automáticamente por **Telegram** y ofrece un **Dashboard Web interactivo en React** con previsiones a 24 horas, brújula de vientos y buscador de ubicaciones.

---

## 🛠️ Tecnologías Utilizadas

- **Backend / Worker**: Python 3, Pydantic, HTTPX, Schedule.
- **Frontend / Dashboard**: React 18, Vite, Lucide React icons, CSS3 Glassmorphism UI.
- **Base de Datos & Backend-as-a-Service**: Supabase (PostgreSQL con RLS).
- **API Meteorológica**: Open-Meteo API (Pronóstico numérico y geocodificación en tiempo real).
- **Notificaciones**: Bot API de Telegram.
- **Automatización**: Concurrently para desarrollo local y GitHub Actions para ejecuciones programadas (CRON).

---

## 🏛️ Arquitectura del Proyecto

```text
ClimaAlert/
├── package.json              # Script raíz para ejecución simultánea (concurrently)
├── start.bat                 # Lanzador automático de un clic para Windows
├── supabase_schema.sql       # Script SQL para tablas, índices y políticas RLS
├── PLANIFICACION_WEB.md      # Planificación de fases y hoja de ruta
│
├── backend/                  # 🐍 Backend & Worker en Python
│   ├── main.py               # Ejecutor principal del ciclo de monitoreo
│   ├── db.py                 # Conector y cliente de persistencia en Supabase
│   ├── analyzer.py           # Motor de reglas climáticas (CAPE, WMO, ráfagas)
│   ├── fetcher.py            # Cliente HTTP para Open-Meteo API
│   ├── notifier.py           # Bot notificador de Telegram
│   ├── config.py             # Carga de variables de entorno y coordenadas fijas
│   ├── schemas.py            # Modelos de datos Pydantic
│   ├── requirements.txt      # Dependencias de Python
│   ├── .env.example          # Plantilla de variables de entorno del backend
│   └── .env                  # Variables privadas de producción (¡No se sube a Git!)
│
└── frontend/                 # ⚛️ Aplicación Web Dashboard en React (Vite)
    ├── src/
    │   ├── App.jsx           # Dashboard principal (Estado global, vistas y tabs)
    │   ├── index.css         # Sistema de diseño, temas visuales y glassmorphism
    │   ├── supabaseClient.js # Cliente JS de Supabase
    │   └── components/       # Componentes del Dashboard
    │       ├── Header.jsx        # Encabezado con estado del sistema y selector de vistas
    │       ├── SearchBar.jsx     # Buscador interactivo de localidades (Geocodificación)
    │       ├── LocationCard.jsx  # Tarjeta de clima actual y previsiones por zona
    │       ├── Forecast24h.jsx   # Carrusel horario de pronóstico de 24 horas
    │       ├── HourlyCard.jsx    # Tarjeta de cada hora con brújula de viento
    │       ├── Banners.jsx       # Banners de estado de alertas meteorológicas
    │       ├── AlertsTable.jsx   # Tabla histórica de eventos MODERATE / SEVERE
    │       └── HistoryTable.jsx  # Historial continuo de mediciones
    ├── .env.local            # Credenciales de Vite para Supabase (¡No se sube a Git!)
    └── package.json
```

---

## 🔒 Seguridad y Variables de Entorno

Todas las claves privadas y archivos sensibles están protegidos mediante `.gitignore`:

### Backend (`backend/.env`)
Crea un archivo `.env` en la carpeta `backend/` basado en `backend/.env.example`:

```env
TELEGRAM_TOKEN=tu_token_aqui
TELEGRAM_CHAT_ID=tu_chat_id_aqui
ENABLE_TELEGRAM=true

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### Frontend (`frontend/.env.local`)
Crea un archivo `.env.local` en la carpeta `frontend/`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## 🗄️ Configuración de la Base de Datos (Supabase)

1. Ingresa a tu proyecto en **Supabase**.
2. Ve al **SQL Editor**.
3. Copia y ejecuta el contenido del archivo [`supabase_schema.sql`](file:///c:/Users/Lucas/Desktop/Meteorologia/ClimaAlert/supabase_schema.sql).
4. El script creará automáticamente:
   - Tabla `mediciones` (historial meteorológico).
   - Tabla `alertas` (registro de alertas severas o moderadas).
   - Políticas RLS (Row Level Security) para acceso anónimo de lectura.

---

## 🚀 Guía de Instalación y Ejecución Local

### 1. Preparación del Entorno Virtual de Python (`venv`)

Desde la raíz del proyecto (`ClimaAlert/`), crea e instala el entorno virtual para el Backend:

```bash
# Crear el entorno virtual en la raíz del proyecto
python -m venv venv

# Activar el entorno virtual
# En Windows (CMD / PowerShell):
venv\Scripts\activate

# En Linux / macOS:
source venv/bin/activate

# Instalar las dependencias de Python del Backend
pip install -r backend/requirements.txt
```

---

### 2. Opciones de Ejecución

Puedes iniciar el proyecto de cualquiera de las siguientes formas:

#### Opción 1: Ejecución Simultánea (Recomendada con `npm`)

Desde la raíz del proyecto, ejecuta:

```bash
# Instalar dependencias del frontend y raíz
npm install
cd frontend && npm install && cd ..

# Iniciar Frontend y Backend al mismo tiempo
npm run dev
```

Comandos individuales desde la raíz:
- `npm run dev:front`: Inicia únicamente el Dashboard web.
- `npm run dev:back`: Inicia únicamente el servicio Python del Backend.

#### Opción 2: Lanzador Automático en Windows (`start.bat`)

Si estás en Windows y ya creaste el `venv` en la raíz, puedes hacer doble clic en [`start.bat`](file:///c:/Users/Lucas/Desktop/Meteorologia/ClimaAlert/start.bat) o ejecutarlo desde la terminal:

```cmd
start.bat
```

Esto abrirá automáticamente dos ventanas independientes: una para el servidor Vite (Frontend) y otra para el monitoreo en Python (Backend).

#### Opción 3: Ejecución Manual Separada

##### 1. Backend (Python)
```bash
# Desde la raíz (o ingresando a backend/)
venv\Scripts\activate          # En Windows
# source venv/bin/activate     # En Linux/macOS

cd backend
python main.py
```

##### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Abre tu navegador en `http://localhost:5173`.

---

## 🌟 Características Destacadas del Dashboard

1. **Previsiones a 24 Horas con Brújula de Viento**: Carrusel interactivo con temperatura, probabilidad de lluvia, volumen proyectado (mm) y rotación dinámica del viento según los grados (°).
2. **Resaltado de Hora Actual ("AHORA")**: La hora en curso se destaca automáticamente con un diseño neón distintivo.
3. **Buscador de Zonas en Tiempo Real**: Permite buscar cualquier localidad del mundo (ej. Palermo, Belgrano, Córdoba, Madrid) para consultar el clima y su pronóstico al instante mediante geocodificación.
4. **Monitoreo Por Zonas**: Vistas en tiempo real para Valentín Alsina, La Boca y Puerto Madero servidas directamente desde Supabase.
5. **Historial & Registro de Alertas**: Tablas interactivas para auditar eventos severos y mediciones históricas.

---

## ☁️ Despliegue Automatizado (GitHub Actions)

El repositorio incluye un flujo en [.github/workflows/cron.yml](file:///.github/workflows/cron.yml) para ejecutar el monitoreo automáticamente cada 15 minutos en la nube.

Para activarlo:
1. Sube el código a GitHub.
2. Agrega los secrets en **Settings > Secrets and variables > Actions**:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `TELEGRAM_TOKEN`
   - `TELEGRAM_CHAT_ID`
3. En `.github/workflows/cron.yml`, descomenta la sección `schedule`.

