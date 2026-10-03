import httpx
from config import TIMEZONE
from schemas import WeatherData

async def fetch_weather_data(lat: float, lon: float) -> WeatherData:
    """
    Obtiene los datos meteorológicos actuales y de muy corto plazo de Open-Meteo.
    Se utiliza current para las variables de tiempo actual y hourly para CAPE,
    ya que CAPE suele estar disponible en el pronóstico por hora.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "weather_code,precipitation,wind_gusts_10m,cloud_cover,wind_direction_10m",
        "hourly": "cape,precipitation_probability",
        "timezone": TIMEZONE,
        "forecast_hours": 4  # Actual + próximas 3 horas
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current", {})
        hourly = data.get("hourly", {})
        
        # Open-Meteo devuelve listas en hourly. Tomamos el primer valor (hora actual) para CAPE.
        cape_value = hourly.get("cape", [0.0])[0] if hourly.get("cape") else 0.0
        
        # Probabilidad de lluvia en las próximas 3 horas (índices 1 al 3)
        rain_probs = hourly.get("precipitation_probability", [])
        next_3h_probs = rain_probs[1:4] if len(rain_probs) > 1 else [0]
        max_rain_prob = max(next_3h_probs) if next_3h_probs else 0
        
        return WeatherData(
            wmo_code=current.get("weather_code", 0),
            precipitation=current.get("precipitation", 0.0),
            wind_gusts=current.get("wind_gusts_10m", 0.0),
            wind_direction=current.get("wind_direction_10m", 0),
            cape=cape_value,
            cloud_cover=current.get("cloud_cover", 0),
            forecast_rain_prob=max_rain_prob
        )
