# ⛈️ ClimaAlert 2.0 — Sistema de Alertas Meteorológicas & Web Dashboard

**ClimaAlert** es una plataforma integral de monitoreo climático y alertas meteorológicas en tiempo real. 

Utiliza modelos de pronóstico numéricos avanzados (a través de la API gratuita de Open-Meteo), almacena el historial continuo de mediciones y eventos severos en una base de datos **Supabase PostgreSQL**, notifica automáticamente por **Telegram** y ofrece un **Dashboard Web interactivo en React** con previsiones a 24 horas y buscador de ubicaciones.

---

## 🏛️ Arquitectura del Proyecto

```text
ClimaAlert/
├── backend/                  # 🐍 Backend & Worker en Python
│   ├── main.py               # Ejecutor principal de monitoreo
│   ├── db.py                 # Conector y persistencia en Supabase
│   ├── analyzer.py           # Motor de reglas climáticas (CAPE, WMO, ráfagas)
│   ├── fetcher.py            # Cliente HTTP para Open-Meteo
│   ├── notifier.py           # Bot notificador de Telegram
│   ├── config.py             # Carga de variables de entorno y coordenadas
│   ├── schemas.py            # Modelos de datos Pydantic
│   ├── requirements.txt      # Dependencias de Python
│   └── .env                  # Variables privadas de producción (¡No se sube a Git!)
│
├── frontend/                 # ⚛️ Aplicación Web Dashboard en React (Vite)
│   ├── src/
│   │   ├── App.jsx           # Dashboard principal con previsiones a 24h y buscador
│   │   ├── index.css         # Estilos visuales en modo oscuro y glassmorphic
│   │   └── supabaseClient.js # Cliente JS de Supabase
│   ├── .env.local            # Credenciales públicas de Vite (¡No se sube a Git!)
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── cron.yml          # GitHub Actions (Desactivado por defecto)
│
├── supabase_schema.sql       # Script SQL para tablas, índices y políticas RLS
└── PLANIFICACION_WEB.md      # Planificación de fases y desarrollo
```

---

## 🔒 Seguridad y Manejo de Claves (`.gitignore`)

Todas las claves privadas y archivos con credenciales se encuentran totalmente protegidos e ignorados por Git a través de [.gitignore](file:///.gitignore):

- `backend/.env`: Almacena `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_TOKEN`, y `TELEGRAM_CHAT_ID`.
- `frontend/.env.local`: Almacena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (pública de solo lectura).

> **Nota de Seguridad:** Ninguna clave se subirá jamás a GitHub.

---

## 🚀 Guía de Uso Local

### 1. Backend (Python)
Para ejecutar el monitoreo y enviar registros a Supabase desde tu computadora:

```bash
# 1. Ingresar a la carpeta backend
cd backend

# 2. Asegurarse de tener instalado requirements.txt
pip install -r requirements.txt

# 3. Ejecutar el monitoreo
python main.py
```

### 2. Frontend Web (React + Vite)
Para levantar el servidor de desarrollo web:

```bash
# 1. Ingresar a la carpeta frontend
cd frontend

# 2. Instalar dependencias (si no lo hiciste antes)
npm install

# 3. Iniciar el servidor local
npm run dev
```
Abre el navegador en `http://localhost:5173`. Para detener el servidor presiona `Ctrl + C`.

---

## 🌟 Características del Dashboard Web

1. **Previsiones a 24 Horas**: Carrusel horario interactivo con temperatura, probabilidad de lluvia, volumen proyectado (mm) y brújula con flecha rotada según la dirección del viento.
2. **Resaltado de Hora Actual ("AHORA")**: La hora en curso se destaca visualmente con una tarjeta azul neón.
3. **Buscador de Zonas en Tiempo Real**: Permite buscar cualquier localidad (ej. Palermo, Belgrano, Quilmes, Córdoba, Rosario) para ver su clima y pronóstico de 24 horas instantáneamente.
4. **Monitoreo por Ubicación**: Tarjetas en vivo para Valentín Alsina, La Boca y Puerto Madero con datos servidos desde Supabase.
5. **Historial de Alertas & Registros**: Tablas completas para auditoría de eventos `MODERATE` y `SEVERE`.

---

## ☁️ Despliegue en la Nube (GitHub Actions)

El repositorio cuenta con un flujo automatizado en [.github/workflows/cron.yml](file:///.github/workflows/cron.yml).

> ⚠️ **IMPORTANTE:** La ejecución automática viene **DESACTIVADA POR DEFECTO** (la sección `schedule: cron` está comentada).
> Puedes hacer `push` o subir el código a GitHub **sin temor a que se ejecute solo o gaste minutos de GitHub Actions**.

### ¿Cómo activarlo en el futuro cuando desees ejecutarlo 24/7?
1. Sube tu código a tu repositorio de GitHub.
2. Ve a **Settings > Secrets and variables > Actions** en GitHub y agrega los Secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `TELEGRAM_TOKEN`
   - `TELEGRAM_CHAT_ID`
3. En [.github/workflows/cron.yml](file:///.github/workflows/cron.yml), descomenta las líneas 5 y 6 (`schedule` y `- cron: '*/15 * * * *'`).
4. Realiza el commit y push. ¡A partir de ese instante correrá solo cada 15 minutos!
