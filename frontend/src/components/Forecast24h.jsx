import React from 'react'
import { Clock, CloudRain, CheckCircle2 } from 'lucide-react'
import HourlyCard from './HourlyCard'

export default function Forecast24h({
  activeLocation,
  availableLocations,
  onSelectLocation,
  forecast24h,
  loadingForecast
}) {
  const rainyHours = forecast24h.filter(h => h.prob >= 40 || h.precip > 0.2)
  const maxRainProbItem = forecast24h.reduce((max, h) => (h.prob > (max?.prob || 0) ? h : max), null)

  return (
    <div className="forecast-24h-box">
      <div className="forecast-header">
        <div className="forecast-title-group">
          <Clock size={22} color="#60a5fa" />
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '700' }}>
            Pronóstico de Próximas 24 Horas: <span style={{ color: '#60a5fa' }}>{activeLocation?.name || 'Seleccione Ubicación'}</span>
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {availableLocations.map((loc) => (
            <button
              key={loc.name}
              onClick={() => onSelectLocation(loc)}
              style={{
                background: activeLocation?.name === loc.name ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: activeLocation?.name === loc.name ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeLocation?.name === loc.name ? '#93c5fd' : '#9ca3af',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {loc.name.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight informativo de lluvia proyectada */}
      {maxRainProbItem && maxRainProbItem.prob >= 40 ? (
        <div className="forecast-alert-highlight" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde68a' }}>
          <CloudRain size={20} color="#fbbf24" />
          <div>
            <strong>Previsión de Lluvia Proyectada:</strong> Alta probabilidad de precipitaciones para el día de <strong>{maxRainProbItem.dayCategory === 'hoy' ? 'hoy' : maxRainProbItem.dayCategory === 'mañana' ? 'mañana' : maxRainProbItem.dayCategory}</strong> a las <strong>{maxRainProbItem.timeStr} hs</strong> ({maxRainProbItem.prob}% prob., {maxRainProbItem.precip} mm esperados).
          </div>
        </div>
      ) : (
        <div className="forecast-alert-highlight">
          <CheckCircle2 size={20} color="#34d399" />
          <div>
            <strong>Condiciones Estables:</strong> Sin precipitaciones significativas proyectadas para las próximas 24 horas en esta zona.
          </div>
        </div>
      )}

      {/* Carrusel horizontal de 24 horas */}
      {loadingForecast ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>Cargando pronóstico detallado a 24 horas...</div>
      ) : (
        <div className="hourly-scroll-container">
          {forecast24h.map((item, idx) => (
            <HourlyCard key={idx} item={item} isCurrentHour={idx === 0} />
          ))}
        </div>
      )}
    </div>
  )
}
