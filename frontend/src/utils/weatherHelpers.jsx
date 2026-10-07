import React from 'react'
import { 
  Sun, 
  Moon, 
  CloudSun, 
  CloudMoon, 
  CloudRain, 
  CloudLightning, 
  Cloud 
} from 'lucide-react'

// Ubicaciones principales monitoreadas
export const LOCATIONS = [
  { name: "Valentín Alsina, AMBA", lat: -34.670, lon: -58.420 },
  { name: "La Boca, CABA", lat: -34.636, lon: -58.363 },
  { name: "Puerto Madero, CABA", lat: -34.611, lon: -58.361 }
]

// Mapeo de iconos por código WMO (con soporte día/noche)
export function getWmoIcon(code, isNight = false) {
  if ([0, 1].includes(code)) {
    return isNight ? <Moon size={20} color="#93c5fd" /> : <Sun size={20} color="#fbbf24" />
  }
  if ([2, 3].includes(code)) {
    return isNight ? <CloudMoon size={20} color="#94a3b8" /> : <CloudSun size={20} color="#fbbf24" />
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={20} color="#60a5fa" />
  if ([95, 96, 99].includes(code)) return <CloudLightning size={20} color="#f87171" />
  return <Cloud size={20} color="#cbd5e1" />
}

// Convertir grados de viento en texto explicativo (Origen -> Destino)
export function getWindDirectionText(deg) {
  if (deg === undefined || deg === null) return "Viento no especificado"
  const directions = [
    { name: "Norte", opposite: "Sur" },
    { name: "Noreste", opposite: "Suroeste" },
    { name: "Este", opposite: "Oeste" },
    { name: "Sureste", opposite: "Noroeste" },
    { name: "Sur", opposite: "Norte" },
    { name: "Suroeste", opposite: "Noreste" },
    { name: "Oeste", opposite: "Este" },
    { name: "Noroeste", opposite: "Sureste" }
  ]
  
  const normalized = ((deg % 360) + 360) % 360
  const index = Math.floor((normalized + 22.5) / 45) % 8
  const dir = directions[index]
  
  return `Viento del ${dir.name} (sopla hacia el ${dir.opposite}) [${Math.round(normalized)}°]`
}
