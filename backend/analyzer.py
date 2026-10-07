from schemas import WeatherData, AlertLevel
from typing import Tuple

def evaluate_weather(data: WeatherData) -> Tuple[AlertLevel, str]:
    """
    Evalúa las condiciones meteorológicas en base a los umbrales definidos
    y devuelve el nivel de alerta correspondiente y la razón.
    """
    # 1. Alerta SEVERA (Alta prioridad)
    if data.wmo_code in [96, 99]:
        return AlertLevel.SEVERE, f"Tormenta severa con posible granizo (Código WMO: {data.wmo_code})"
        
    if data.cape > 1500 and data.precipitation > 8:
        return AlertLevel.SEVERE, f"Alta inestabilidad y lluvia torrencial (CAPE: {data.cape} J/kg, Lluvia: {data.precipitation} mm/h)"

    if data.precipitation > 12:
        return AlertLevel.SEVERE, f"Lluvia torrencial detectada ({data.precipitation} mm/h)"

    if data.wind_gusts > 60:
        return AlertLevel.SEVERE, f"Ráfagas de viento muy fuertes ({data.wind_gusts} km/h)"
        
    # 2. Alerta MODERADA / ATENCIÓN (Media prioridad)
    if data.wmo_code == 95:
        return AlertLevel.MODERATE, "Tormenta eléctrica detectada (Código WMO: 95)"
        
    if data.precipitation >= 3.0:
        return AlertLevel.MODERATE, f"Precipitaciones moderadas/intensas ({data.precipitation} mm/h)"
        
    if data.forecast_rain_prob >= 70:
        return AlertLevel.MODERATE, f"Alta probabilidad de lluvias proyectadas ({data.forecast_rain_prob}%)"

    if data.wind_gusts > 40:
        return AlertLevel.MODERATE, f"Ráfagas de viento moderadas ({data.wind_gusts} km/h)"
        
    # 3. Sin Alerta
    return AlertLevel.NONE, "Condiciones climáticas normales"
