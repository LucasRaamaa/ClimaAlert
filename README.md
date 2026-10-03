# 🌩️ ClimaAlert

Un sistema personal, asíncrono y de bajo consumo de recursos para el monitoreo de alertas meteorológicas a corto plazo. 

ClimaAlert evalúa constantemente las condiciones climáticas de múltiples ubicaciones (utilizando la API gratuita de [Open-Meteo](https://open-meteo.com/)) y envía notificaciones push directamente a tu iPhone vía **Telegram** únicamente cuando se detectan tormentas severas, lluvia torrencial o ráfagas de viento peligrosas.

---

## ✨ Características Principales

- 📍 **Multi-Ubicación**: Monitorea simultáneamente distintos barrios (Ej: Valentín Alsina, La Boca, Puerto Madero).
- 🧠 **Motor de Reglas y Umbrales**: Evalúa de manera estricta variables como Códigos WMO, Precipitación por hora, Ráfagas de viento y energía CAPE (inestabilidad).
- 🧭 **Predicción de Movimiento**: Analiza la dirección del viento en superficie para predecir de dónde viene y hacia dónde se dirige la masa de aire de una tormenta.
- ☔ **Pronóstico a Corto Plazo**: Determina la probabilidad máxima de precipitación en las próximas 3 horas consultando los mejores modelos meteorológicos globales, sin depender de pluviómetros físicos.
- 🛡️ **Lógica Anti-Spam Individual**: Mantiene un registro local (`estado.json`) del estado de cada ubicación. Si la alerta es continua, el bot entra en modo silencioso por 90 minutos para no inundarte de notificaciones.
- ⚡ **Alta Performance**: Escrito en Python 3.10+ usando Pydantic, HTTPX y llamadas asíncronas (`asyncio`).

---

## ⚙️ Umbrales de Alerta Definidos

| Nivel | Prioridad | Regla |
| :---: | :--- | :--- |
| 🔴 **Severa** | Alta | Código WMO 96 o 99 (Tormenta con Granizo) <br> **O** <br> Lluvia > 10 mm/h **Y** CAPE > 1800 J/kg |
| 🟠 **Moderada** | Media | Código WMO 95 (Tormenta Eléctrica) <br> **O** <br> Lluvia > 15 mm/h <br> **O** <br> Ráfagas de viento > 60 km/h |

---

## 🚀 Instalación Local

1. Clona el repositorio o descarga los archivos.
2. Crea un entorno virtual e instala las dependencias:
   ```bash
   python -m venv venv
   # En Windows:
   .\venv\Scripts\activate
   # En Linux/Mac:
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. Renombra el archivo `.env.example` a `.env` y coloca tus credenciales del bot de Telegram:
   ```env
   TELEGRAM_TOKEN=tu_token_aqui
   TELEGRAM_CHAT_ID=tu_chat_id_aqui
   ```

4. Ejecuta el script para probarlo de forma manual (verás el clima impreso en la consola incluso si no hay alerta activa):
   ```bash
   python main.py
   ```

---

## 🗺️ Agregar Ubicaciones

Para agregar nuevas zonas de monitoreo, simplemente edita la lista `LOCATIONS` en el archivo `config.py`:

```python
LOCATIONS = [
    {"name": "Valentín Alsina, AMBA", "lat": -34.670, "lon": -58.420},
    {"name": "Recoleta, CABA", "lat": -34.588, "lon": -58.397},
]
```

---

## ☁️ Despliegue en la Nube (GitHub Actions)

Este proyecto incluye un archivo de configuración listo para ser ejecutado **100% gratis** utilizando GitHub Actions. 

Por defecto, la ejecución automática viene desactivada para que puedas subir tu código sin errores. Sigue estos pasos para activarlo:

1. Sube este código a un repositorio **Privado** en GitHub.
2. Ve a la pestaña **Settings > Secrets and variables > Actions** de tu repositorio.
3. Agrega dos nuevos *Repository Secrets*:
   - `TELEGRAM_TOKEN` (El token de tu bot)
   - `TELEGRAM_CHAT_ID` (Tu ID de chat)
4. Abre el archivo `.github/workflows/cron.yml` en tu editor.
5. Descomenta las dos líneas de `schedule` y `cron` quitando el hashtag `#` (líneas 4 y 5):
   ```yaml
   on:
     schedule:
       - cron: '*/15 * * * *'
   ```
6. Realiza el *commit* de ese cambio y súbelo. ¡A partir de ese momento el bot comenzará a analizar el cielo cada 15 minutos de forma perpetua!

> **Nota Anti-Spam:** El flujo de trabajo de GitHub Action está configurado para realizar un pequeño `git commit` y actualizar el archivo `estado.json` tras cada análisis, preservando la memoria del bot entre cada ejecución y evitando que te llene el teléfono de mensajes duplicados.

---
*Hecho para monitorear el cielo del AMBA.* ⛈️🇦🇷
