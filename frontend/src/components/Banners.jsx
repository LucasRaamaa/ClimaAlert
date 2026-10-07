import React from 'react'
import { ShieldAlert, MapPin } from 'lucide-react'

export function AlertBanner({ activeCriticalAlert }) {
  if (!activeCriticalAlert) return null

  return (
    <div className={`alert-banner ${activeCriticalAlert.nivel_alerta_nombre.toLowerCase()}`}>
      <div className="alert-banner-icon">
        <ShieldAlert size={32} />
      </div>
      <div className="alert-banner-content">
        <h4>
          ALERTA {activeCriticalAlert.nivel_alerta_nombre === 'SEVERE' ? 'SEVERA' : 'MODERADA'}: {activeCriticalAlert.ubicacion}
        </h4>
        <p>{activeCriticalAlert.motivo} — Registrado a las {new Date(activeCriticalAlert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs.</p>
      </div>
    </div>
  )
}

export function CustomLocationBanner({ selectedCustomLocation, onResetLocation }) {
  if (!selectedCustomLocation) return null

  return (
    <div style={{ 
      background: 'rgba(59, 130, 246, 0.15)', 
      border: '1px solid rgba(59, 130, 246, 0.4)', 
      borderRadius: '12px', 
      padding: '14px 20px', 
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MapPin size={22} color="#60a5fa" />
        <div>
          <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>Búsqueda activa: {selectedCustomLocation.name}</span>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Lat: {selectedCustomLocation.lat} | Lon: {selectedCustomLocation.lon}</div>
        </div>
      </div>
      <button 
        onClick={onResetLocation}
        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}
      >
        Volver a zonas fijas
      </button>
    </div>
  )
}
