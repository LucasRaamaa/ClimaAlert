import React from 'react'
import { CloudLightning, RefreshCw } from 'lucide-react'

export default function Header({ refreshing, loading, onRefresh }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon">
          <CloudLightning size={28} />
        </div>
        <div>
          <h1 className="brand-title">ClimaAlert Dashboard</h1>
          <p className="brand-subtitle">Monitoreo y Previsiones Meteorológicas a 24 Horas</p>
        </div>
      </div>

      <div className="header-controls">
        <div className="live-badge">
          <span className="live-dot"></span>
          Monitoreo Activo
        </div>

        <button 
          className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
          onClick={onRefresh}
          disabled={refreshing || loading}
          title="Refrescar datos de Supabase"
        >
          <RefreshCw size={16} />
          {refreshing ? 'Actualizando...' : 'Refrescar'}
        </button>
      </div>
    </header>
  )
}
