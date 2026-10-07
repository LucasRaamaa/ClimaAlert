import React from 'react'
import { CloudRain, Wind, Droplets, Activity, CheckCircle2, AlertTriangle, ShieldAlert, Navigation } from 'lucide-react'
import { getWindDirectionText } from '../utils/weatherHelpers'

export default function LocationCard({ locObj, record, onSelectForecast }) {
  if (!record) {
    return (
      <div className="location-card">
        <div className="location-card-header">
          <div>
            <div className="location-name">{locObj.name}</div>
            <div className="location-coords">Lat: {locObj.lat} | Lon: {locObj.lon}</div>
          </div>
        </div>
        <p style={{ color: '#6b7280', padding: '20px 0' }}>Sin mediciones registradas aún.</p>
      </div>
    )
  }

  const isSevere = record.nivel_alerta === 2 || record.precipitacion >= 12.0 || record.rafagas_viento >= 60.0
  const isModerate = record.nivel_alerta === 1 || record.probabilidad_lluvia >= 70 || record.precipitacion >= 3.0 || record.rafagas_viento >= 40.0

  const alertClass = isSevere ? 'severe' : isModerate ? 'moderate' : 'normal'
  const alertLabel = isSevere ? 'SEVERO' : isModerate ? 'ATENCIÓN' : 'NORMAL'

  return (
    <div className="location-card">
      <div className="location-card-header">
        <div>
          <div className="location-name">{locObj.name}</div>
          <div className="location-coords">Lat: {record.latitud} | Lon: {record.longitud}</div>
        </div>

        <span className={`status-tag ${alertClass}`}>
          {!isSevere && !isModerate && <CheckCircle2 size={12} />}
          {isModerate && !isSevere && <AlertTriangle size={12} />}
          {isSevere && <ShieldAlert size={12} />}
          {alertLabel}
        </span>
      </div>

      <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '2px' }}>Condición Registrada</div>
        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#f3f4f6' }}>{record.motivo_alerta}</div>
      </div>

      <div className="card-metrics-grid">
        <div className="metric-item">
          <div className="metric-item-head">
            <CloudRain size={14} color="#60a5fa" /> Precipitaciones
          </div>
          <div className="metric-item-val">{record.precipitacion} <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>mm/h</span></div>
        </div>

        <div className="metric-item" title={record.direccion_viento !== undefined ? `🧭 ${getWindDirectionText(record.direccion_viento)}` : ''} style={{ cursor: 'help' }}>
          <div className="metric-item-head">
            <Wind size={14} color="#fbbf24" /> Ráfagas Viento
          </div>
          <div className="metric-item-val" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {record.direccion_viento !== undefined && record.direccion_viento !== null && (
              <Navigation 
                size={13} 
                style={{ transform: `rotate(${record.direccion_viento}deg)`, color: '#fbbf24' }} 
              />
            )}
            <span>{record.rafagas_viento} <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>km/h</span></span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-item-head">
            <Droplets size={14} color="#34d399" /> Prob. Lluvia 3h
          </div>
          <div className="metric-item-val">{record.probabilidad_lluvia}%</div>
        </div>

        <div className="metric-item">
          <div className="metric-item-head">
            <Activity size={14} color="#22d3ee" /> CAPE (Energía)
          </div>
          <div className="metric-item-val">{record.cape} <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>J/kg</span></div>
        </div>
      </div>

      <div className="card-footer-info">
        <button 
          onClick={() => onSelectForecast(locObj)}
          style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
        >
          Ver Pronóstico 24h ➔
        </button>

        <div>
          {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
        </div>
      </div>
    </div>
  )
}
