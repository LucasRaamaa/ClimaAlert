from schemas import WeatherData, AlertLevel
from typing import Tuple

def evaluate_weather(data: WeatherData) -> Tuple[AlertLevel, str]:
    """
    Evalúa las condiciones meteorológicas en base a los umbrales definidos
    y devuelve el nivel de alerta correspondiente y la razón.
    """
    # 1. Alerta SEVERA (Alta prioridad)
    if data.wmo_code in [96, 99]:
        return AlertLevel.SEVERE, f"Tormenta severa con granizo (Código WMO: {data.wmo_code})"
        
    if data.cape > 1800 and data.precipitation > 10:
        return AlertLevel.SEVERE, f"Alta inestabilidad y lluvia torrencial (CAPE: {data.cape} J/kg, Lluvia: {data.precipitation} mm/h)"
        
    # 2. Alerta MODERADA (Media prioridad)
    if data.wmo_code == 95:
        return AlertLevel.MODERATE, "Tormenta eléctrica detectada (Código WMO: 95)"
        
    if data.precipitation > 15:
        return AlertLevel.MODERATE, f"Lluvia intensa detectada ({data.precipitation} mm/h)"
        
    if data.wind_gusts > 60:
        return AlertLevel.MODERATE, f"Ráfagas de viento peligrosas ({data.wind_gusts} km/h)"
        
    # 3. Sin Alerta
    return AlertLevel.NONE, "Condiciones climáticas normales"
