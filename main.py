import sys
import asyncio
import json

# Forzar UTF-8 en la consola de Windows para soportar emojis sin que la app falle
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import os
import time
from datetime import datetime
from fetcher import fetch_weather_data
from analyzer import evaluate_weather
from notifier import send_telegram_alert
from schemas import AlertLevel
from config import LOCATIONS

STATE_FILE = "estado.json"

def load_state() -> dict:
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_state(state: dict):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)

async def check_and_notify():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando monitoreo meteorológico para {len(LOCATIONS)} ubicaciones...")
    
    state = load_state()
    
    for loc in LOCATIONS:
        name = loc["name"]
        lat = loc["lat"]
        lon = loc["lon"]
        
        try:
            # 1. Obtener datos por ubicación
            data = await fetch_weather_data(lat, lon)
            
            # 2. Evaluar reglas
            level, reason = evaluate_weather(data)
            
            if level == AlertLevel.NONE:
                print(f"[OK] {name}: Tranquilo. Nubosidad: {data.cloud_cover}% | Lluvia (próx 3h): {data.forecast_rain_prob}% | Vientos: {data.wind_direction_text}")
                # Reiniciamos el estado para esta ubicación
                state[name] = {"last_alert_level": AlertLevel.NONE.value, "last_alert_time": 0}
                continue
                
            # 3. Lógica Anti-Spam (por ubicación)
            loc_state = state.get(name, {"last_alert_level": AlertLevel.NONE.value, "last_alert_time": 0})
            last_level = AlertLevel(loc_state["last_alert_level"])
            last_time = loc_state["last_alert_time"]
            
            now = time.time()
            time_diff_minutes = (now - last_time) / 60.0
            
            should_notify = False
            
            if level.value > last_level.value:
                print(f"[!] {name}: El nivel de peligro escaló. Notificando inmediatamente...")
                should_notify = True
            elif time_diff_minutes > 90:
                print(f"[!] {name}: Alerta continua. Han pasado {int(time_diff_minutes)} min desde el último aviso.")
                should_notify = True
            else:
                print(f"[Anti-Spam] {name}: Omitiendo notificación (Hace {int(time_diff_minutes)} min se notificó: {last_level.name}).")
                
            # 4. Enviar notificación si corresponde
            if should_notify:
                alert_prefix = "🔴 *ALERTA SEVERA*" if level == AlertLevel.SEVERE else "🟠 *ALERTA MODERADA*"
                message = (
                    f"{alert_prefix}\n\n"
                    f"📍 *Ubicación:* {name}\n"
                    f"⚠️ *Motivo:* {reason}\n\n"
                    f"📊 *Detalles Actuales:*\n"
                    f"🌧 Lluvia: {data.precipitation} mm/h\n"
                    f"💨 Ráfagas: {data.wind_gusts} km/h\n"
                    f"🌬️ Movimiento: {data.wind_direction_text}\n"
                    f"☔ Prob. Lluvia (próx 3h): {data.forecast_rain_prob}%\n"
                    f"⚡ CAPE: {data.cape} J/kg\n"
                    f"☁️ Nubosidad: {data.cloud_cover}% ({data.cloud_cover_text})"
                )
                
                print(f"\n--- MENSAJE A ENVIAR ({name}) ---\n{message}\n------------------------\n")
                await send_telegram_alert(message)
                
                # Actualizar el estado para esta ubicación
                state[name] = {"last_alert_level": level.value, "last_alert_time": now}
                
        except Exception as e:
            print(f"[ERROR] Falló la ejecución para {name}: {e}")

    # Guardar el estado completo (todas las ubicaciones) al final
    save_state(state)
    print("[OK] Monitoreo finalizado.")

if __name__ == "__main__":
    asyncio.run(check_and_notify())
