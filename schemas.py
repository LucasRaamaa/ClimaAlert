from pydantic import BaseModel, Field
from enum import Enum

class AlertLevel(Enum):
    NONE = 0
    MODERATE = 1
    SEVERE = 2

class WeatherData(BaseModel):
    wmo_code: int = Field(default=0, description="Código del tiempo según la WMO")
    cape: float = Field(default=0.0, description="Energía Potencial Convectiva Disponible (J/kg)")
    precipitation: float = Field(default=0.0, description="Precipitación en la última hora (mm/h)")
    wind_gusts: float = Field(default=0.0, description="Ráfagas de viento a 10m (km/h)")
    wind_direction: int = Field(default=0, description="Dirección del viento a 10m (grados 0-360)")
    cloud_cover: int = Field(default=0, description="Nubosidad en porcentaje (0-100)")
    forecast_rain_prob: int = Field(default=0, description="Probabilidad máxima de lluvia en las próximas 3 horas (%)")
    
    @property
    def wind_direction_text(self) -> str:
        # Divide 360 grados en 8 puntos cardinales
        dirs = ["Norte", "Noreste", "Este", "Sureste", "Sur", "Suroeste", "Oeste", "Noroeste", "Norte"]
        ix = int((self.wind_direction + 22.5) / 45.0)
        origen = dirs[ix % 8]
        # La tormenta se dirige al lado opuesto del viento (180 grados)
        destino = dirs[(ix + 4) % 8]
        return f"Viene del {origen} hacia el {destino} 🧭"
    
    @property
    def cloud_cover_text(self) -> str:
        if self.cloud_cover <= 20: return "Despejado ☀️"
        elif self.cloud_cover <= 50: return "Parcialmente Nublado ⛅"
        elif self.cloud_cover <= 80: return "Mayormente Nublado 🌥️"
        else: return "Totalmente Nublado ☁️"
