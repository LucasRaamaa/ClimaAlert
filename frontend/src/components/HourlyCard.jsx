import React from 'react'
import { Navigation } from 'lucide-react'
import { getWmoIcon, getWindDirectionText } from '../utils/weatherHelpers'

export default function HourlyCard({ item, isCurrentHour }) {
  return (
    <div 
      className={`hourly-card ${item.isNight ? 'nighttime' : 'daytime'} ${isCurrentHour ? 'current-hour' : ''} ${item.dayCategory === 'mañana' ? 'tomorrow-card' : ''} ${item.prob >= 40 ? 'rainy' : ''}`}
    >
      {isCurrentHour && <div className="now-tag">AHORA</div>}
      <div className="hourly-day-tag">{item.dayLabel}</div>
      <div className="hourly-time">{item.timeStr} hs</div>
      <div style={{ margin: '6px 0' }}>{getWmoIcon(item.code, item.isNight)}</div>
      <div className="hourly-temp">{item.temp}°C</div>
      
      <div className="hourly-prob">
        💧 {item.prob}%
      </div>
      
      <div className="prob-bar-track">
        <div className="prob-bar-fill" style={{ width: `${item.prob}%` }}></div>
      </div>

      <div style={{ fontSize: '0.7rem', color: '#93c5fd', marginTop: '4px', opacity: item.precip > 0 ? 1 : 0 }}>
        {item.precip > 0 ? `${item.precip} mm` : '0 mm'}
      </div>

      {/* Brújula y Dirección del Viento con Flechita */}
      <div 
        style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'help' }}
        title={`🧭 ${getWindDirectionText(item.windDir)} | Ráfagas a ${item.gust} km/h`}
      >
        <Navigation 
          size={11} 
          className="wind-dir-arrow" 
          style={{ transform: `rotate(${item.windDir}deg)` }} 
        />
        <span>{item.gust}k/h</span>
      </div>
    </div>
  )
}
