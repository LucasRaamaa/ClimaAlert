import React from 'react'

export default function HistoryTable({ allRecords }) {
  return (
    <div className="table-container">
      {allRecords.length === 0 ? (
        <div className="empty-box">
          <p>No hay registros en la base de datos.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Ubicación</th>
              <th>Condición</th>
              <th>Lluvia</th>
              <th>Viento</th>
              <th>Prob. Lluvia</th>
              <th>CAPE</th>
            </tr>
          </thead>
          <tbody>
            {allRecords.map((rec) => (
              <tr key={rec.id}>
                <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                  {new Date(rec.created_at).toLocaleString()}
                </td>
                <td style={{ fontWeight: '600' }}>{rec.ubicacion}</td>
                <td style={{ color: '#d1d5db' }}>{rec.motivo_alerta}</td>
                <td style={{ color: '#60a5fa' }}>{rec.precipitacion} mm/h</td>
                <td style={{ color: '#fbbf24' }}>{rec.rafagas_viento} km/h</td>
                <td>{rec.probabilidad_lluvia}%</td>
                <td>{rec.cape} J/kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
