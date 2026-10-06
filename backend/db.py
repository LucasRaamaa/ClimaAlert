import os
from typing import Optional
from supabase import create_client, Client
from schemas import WeatherData, AlertLevel
from config import SUPABASE_URL, SUPABASE_KEY

supabase: Optional[Client] = None

if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "https://tu-proyecto.supabase.co":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[ADVERTENCIA] No se pudo inicializar el cliente de Supabase: {e}")

def save_weather_record(name: str, lat: float, lon: float, data: WeatherData, level: AlertLevel, reason: str):
    """
    Inserta una medición meteorológica en la tabla 'registros_clima'.
    """
    if not supabase:
        print("[DB] Supabase no configurado. Omitiendo guardado en BD.")
        return

    payload = {
        "ubicacion": name,
        "latitud": lat,
        "longitud": lon,
        "wmo_code": data.wmo_code,
        "cape": data.cape,
        "precipitacion": data.precipitation,
        "rafagas_viento": data.wind_gusts,
        "direccion_viento": data.wind_direction,
        "nubosidad": data.cloud_cover,
        "probabilidad_lluvia": data.forecast_rain_prob,
        "nivel_alerta": level.value,
        "nivel_alerta_nombre": level.name,
        "motivo_alerta": reason
    }

    try:
        supabase.table("registros_clima").insert(payload).execute()
        print(f"[DB OK] Registro de clima guardado para {name}")
    except Exception as e:
        print(f"[DB ERROR] Error guardando registro en 'registros_clima': {e}")

def save_alert_record(name: str, lat: float, lon: float, level: AlertLevel, reason: str, data: WeatherData, notified_telegram: bool = True):
    """
    Inserta un evento de alerta (MODERATE / SEVERE) en la tabla 'alertas'.
    """
    if not supabase:
        print("[DB] Supabase no configurado. Omitiendo guardado de alerta.")
        return

    payload = {
        "ubicacion": name,
        "latitud": lat,
        "longitud": lon,
        "nivel_alerta": level.value,
        "nivel_alerta_nombre": level.name,
        "motivo": reason,
        "detalles": data.model_dump(),
        "notificado_telegram": notified_telegram
    }

    try:
        supabase.table("alertas").insert(payload).execute()
        print(f"[DB OK] Alerta {level.name} guardada en BD para {name}")
    except Exception as e:
        print(f"[DB ERROR] Error guardando en tabla 'alertas': {e}")
