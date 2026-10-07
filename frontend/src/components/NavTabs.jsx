import React from 'react'
import { Activity, AlertTriangle, Database } from 'lucide-react'

export default function NavTabs({ activeTab, onTabClick, alertsCount }) {
  return (
    <div className="tabs-header">
      <button 
        className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onTabClick('dashboard')}
      >
        <Activity size={18} /> Monitoreo en Vivo (Supabase)
      </button>

      <button 
        className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
        onClick={() => onTabClick('alerts')}
      >
        <AlertTriangle size={18} /> Historial de Alertas ({alertsCount})
      </button>

      <button 
        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onTabClick('history')}
      >
        <Database size={18} /> Registros en BD
      </button>
    </div>
  )
}
