import React from 'react'
import { CheckCircle2, MapPin } from 'lucide-react'

export default function AlertsTable({ recentAlerts }) {
  return (
    <div className="table-container">
      {recentAlerts.length === 0 ? (
        <div className="empty-box">
          <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '12px' }} />
          <h3>Sin alertas recientes</h3>
          <p>No se han registrado alertas en las últimas horas.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Ubicación</th>
              <th>Nivel Alerta</th>
              <th>Motivo</th>
              <th>Telegram</th>
            </tr>
          </thead>
          <tbody>
            {recentAlerts.map((alert) => (
              <tr key={alert.id}>
                <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                  {new Date(alert.created_at).toLocaleString()}
                </td>
                <td style={{ fontWeight: '600' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px', color: '#60a5fa' }} />
                  {alert.ubicacion}
                </td>
                <td>
                  <span className={`status-tag ${alert.nivel_alerta_nombre.toLowerCase()}`}>
                    {alert.nivel_alerta_nombre}
                  </span>
                </td>
                <td style={{ color: '#e5e7eb' }}>{alert.motivo}</td>
                <td>
                  {alert.notificado_telegram ? (
                    <span style={{ color: '#34d399', fontSize: '0.82rem' }}>Enviado 📲</span>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>Desactivado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
