import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { 
  CloudLightning, 
  Wind, 
  Droplets, 
  CloudRain, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  MapPin, 
  Search, 
  Sun, 
  Cloud, 
  CloudSun, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  Navigation,
  X 
} from 'lucide-react'


// Ubicaciones principales monitoreadas
const LOCATIONS = [
  { name: "Valentín Alsina, AMBA", lat: -34.670, lon: -58.420 },
  { name: "La Boca, CABA", lat: -34.636, lon: -58.363 },
  { name: "Puerto Madero, CABA", lat: -34.611, lon: -58.361 }
]

// Mapeo de iconos por código WMO
function getWmoIcon(code) {
  if ([0, 1].includes(code)) return <Sun size={20} color="#fbbf24" />
  if ([2, 3].includes(code)) return <CloudSun size={20} color="#94a3b8" />
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={20} color="#60a5fa" />
  if ([95, 96, 99].includes(code)) return <CloudLightning size={20} color="#f87171" />
  return <Cloud size={20} color="#cbd5e1" />
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'alerts' | 'history'
  const [latestRecords, setLatestRecords] = useState([])
  const [recentAlerts, setRecentAlerts] = useState([])
  const [allRecords, setAllRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [lastFetchTime, setLastFetchTime] = useState(0)

  // Buscador de Zonas
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedCustomLocation, setSelectedCustomLocation] = useState(null)

  // Previsiones a 24 horas
  const [activeLocationForForecast, setActiveLocationForForecast] = useState(LOCATIONS[0])
  const [forecast24h, setForecast24h] = useState([])
  const [loadingForecast, setLoadingForecast] = useState(false)

  // 1. Cargar datos desde Supabase
  const fetchData = useCallback(async (showSpinner = false) => {
    const now = Date.now()
    if (showSpinner && now - lastFetchTime < 2000) return

    if (showSpinner) setRefreshing(true)
    setLastFetchTime(now)
    
    try {
      // Obtener el último registro de cada ubicación principal
      const latestPromises = LOCATIONS.map(async (loc) => {
        const { data, error } = await supabase
          .from('registros_clima')
          .select('*')
          .eq('ubicacion', loc.name)
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (error) throw error
        return data && data.length > 0 ? data[0] : null
      })

      const latestResults = await Promise.all(latestPromises)
      setLatestRecords(latestResults.filter(Boolean))

      // Obtener alertas recientes (últimas 20)
      const { data: alertsData } = await supabase
        .from('alertas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      setRecentAlerts(alertsData || [])

      // Obtener historial completo
      const { data: historyData } = await supabase
        .from('registros_clima')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      setAllRecords(historyData || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error obteniendo datos de Supabase:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [lastFetchTime])

  // 2. Cargar Pronóstico de 24 horas desde Open-Meteo
  const fetch24hForecast = useCallback(async (location) => {
    if (!location || !location.lat || !location.lon) return
    setLoadingForecast(true)

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_gusts_10m,wind_direction_10m&timezone=America/Argentina/Buenos_Aires&forecast_days=2`
      const res = await fetch(url)
      const data = await res.json()

      if (data && data.hourly) {
        const nowIndex = new Date().getHours()
        const times = data.hourly.time || []
        const temps = data.hourly.temperature_2m || []
        const probs = data.hourly.precipitation_probability || []
        const precips = data.hourly.precipitation || []
        const codes = data.hourly.weather_code || []
        const gusts = data.hourly.wind_gusts_10m || []
        const dirs = data.hourly.wind_direction_10m || []

        // Tomar las 24 horas a partir de la hora actual
        const hourlyItems = []
        for (let i = nowIndex; i < Math.min(nowIndex + 24, times.length); i++) {
          const dateObj = new Date(times[i])
          hourlyItems.push({
            timeStr: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dayStr: dateObj.toLocaleDateString([], { weekday: 'short' }),
            temp: Math.round(temps[i]),
            prob: probs[i] || 0,
            precip: precips[i] || 0,
            code: codes[i] || 0,
            gust: Math.round(gusts[i] || 0),
            windDir: dirs[i] || 0
          })
        }
        setForecast24h(hourlyItems)
      }

    } catch (err) {
      console.error('Error obteniendo pronóstico 24h:', err)
    } finally {
      setLoadingForecast(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (activeLocationForForecast) {
      fetch24hForecast(activeLocationForForecast)
    }
  }, [activeLocationForForecast, fetch24hForecast])

  // Temporizador de autochequeo cada 30 seg
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // 3. Buscar ubicaciones en tiempo real (Geocoding Open-Meteo)
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=es&format=json`)
        const data = await res.json()
        setSearchResults(data.results || [])
      } catch (e) {
        console.error('Error buscando ubicación:', e)
      } finally {
        setSearching(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Manejar selección de búsqueda
  const handleSelectSearchResult = (result) => {
    const name = `${result.name}${result.admin1 ? `, ${result.admin1}` : ''} (${result.country || ''})`
    const locObj = {
      name,
      lat: result.latitude,
      lon: result.longitude
    }

    setSelectedCustomLocation(locObj)
    setActiveLocationForForecast(locObj)
    setSearchQuery('')
    setSearchResults([])
  }

  // Resumen del pronóstico a 24 horas
  const rainyHours = forecast24h.filter(h => h.prob >= 40 || h.precip > 0.2)
  const maxRainProbItem = forecast24h.reduce((max, h) => (h.prob > (max?.prob || 0) ? h : max), null)

  const activeCriticalAlert = recentAlerts.find(a => {
    const hours = (new Date() - new Date(a.created_at)) / (1000 * 60 * 60)
    return hours <= 6
  })

  return (
    <div className="app-container">
      {/* HEADER */}
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
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            title="Refrescar datos de Supabase"
          >
            <RefreshCw size={16} />
            {refreshing ? 'Actualizando...' : 'Refrescar'}
          </button>
        </div>
      </header>

      {/* 🔍 BUSCADOR DE ZONAS (Ej: Palermo, Quilmes, Córdoba, etc.) */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={20} className="search-input-icon" />
          <input 
            type="text" 
            className="search-input"
            placeholder="🔎 Buscar cualquier zona (ej. Palermo, Belgrano, Quilmes, Rosario)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <X 
              size={18} 
              style={{ position: 'absolute', right: '16px', cursor: 'pointer', color: '#9ca3af' }}
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
            />
          )}
        </div>

        {/* Dropdown de resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map((res) => (
              <div 
                key={res.id} 
                className="search-result-item"
                onClick={() => handleSelectSearchResult(res)}
              >
                <div>
                  <div className="search-result-name">📍 {res.name}</div>
                  <div className="search-result-sub">{res.admin1 ? `${res.admin1}, ` : ''}{res.country}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '600' }}>
                  Ver Pronóstico ➡️
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BANNER DE ZONA BUSCADA (Si el usuario seleccionó Palermo, etc.) */}
      {selectedCustomLocation && (
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
            onClick={() => {
              setSelectedCustomLocation(null)
              setActiveLocationForForecast(LOCATIONS[0])
            }}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}
          >
            Volver a zonas fijas
          </button>
        </div>
      )}

      {/* BANNER DE ALERTA CRÍTICA RECIENTE */}
      {activeCriticalAlert && (
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
      )}

      {/* 🔮 PREVISIONES A 24 HORAS DE LA ZONA SELECCIONADA */}
      <div className="forecast-24h-box">
        <div className="forecast-header">
          <div className="forecast-title-group">
            <Clock size={22} color="#60a5fa" />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: '700' }}>
              Pronóstico de Próximas 24 Horas: <span style={{ color: '#60a5fa' }}>{activeLocationForForecast?.name || 'Seleccione Ubicación'}</span>
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[...LOCATIONS, ...(selectedCustomLocation ? [selectedCustomLocation] : [])].map((loc) => (
              <button
                key={loc.name}
                onClick={() => setActiveLocationForForecast(loc)}
                style={{
                  background: activeLocationForForecast?.name === loc.name ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: activeLocationForForecast?.name === loc.name ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: activeLocationForForecast?.name === loc.name ? '#93c5fd' : '#9ca3af',
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
              <strong>Previsión de Lluvia Proyectada:</strong> Alta probabilidad de precipitaciones a las <strong>{maxRainProbItem.timeStr} hs</strong> ({maxRainProbItem.prob}% prob., {maxRainProbItem.precip} mm esperados).
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
          <div style={{ padding: '30px', textTransform: 'center', color: '#9ca3af' }}>Cargando pronóstico detallado a 24 horas...</div>
        ) : (
          <div className="hourly-scroll-container">
            {forecast24h.map((item, idx) => (
              <div key={idx} className={`hourly-card ${idx === 0 ? 'current-hour' : ''} ${item.prob >= 40 ? 'rainy' : ''}`}>
                {idx === 0 && <div className="now-tag">AHORA</div>}
                <div className="hourly-time">{item.timeStr}</div>
                <div style={{ margin: '6px 0' }}>{getWmoIcon(item.code)}</div>
                <div className="hourly-temp">{item.temp}°C</div>
                
                <div className="hourly-prob">
                  💧 {item.prob}%
                </div>
                
                <div className="prob-bar-track">
                  <div className="prob-bar-fill" style={{ width: `${item.prob}%` }}></div>
                </div>

                {item.precip > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#93c5fd', marginTop: '4px' }}>
                    {item.precip} mm
                  </div>
                )}

                {/* Brújula y Dirección del Viento con Flechita */}
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Navigation 
                    size={11} 
                    className="wind-dir-arrow" 
                    style={{ transform: `rotate(${item.windDir}deg)` }} 
                    title={`Viento a ${item.windDir}° (${item.gust} km/h)`}
                  />
                  <span>{item.gust}k/h</span>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={18} /> Monitoreo en Vivo (Supabase)
        </button>

        <button 
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <AlertTriangle size={18} /> Historial de Alertas ({recentAlerts.length})
        </button>

        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Database size={18} /> Registros en BD
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      {loading ? (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Cargando mediciones desde Supabase...</p>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div className="location-cards-grid">
              {LOCATIONS.map((locObj) => {
                const record = latestRecords.find(r => r.ubicacion === locObj.name)
                
                if (!record) {
                  return (
                    <div key={locObj.name} className="location-card">
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

                const alertClass = record.nivel_alerta === 2 ? 'severe' : record.nivel_alerta === 1 ? 'moderate' : 'normal'
                const alertLabel = record.nivel_alerta === 2 ? 'SEVERO' : record.nivel_alerta === 1 ? 'MODERADO' : 'NORMAL'

                return (
                  <div key={locObj.name} className="location-card">
                    <div className="location-card-header">
                      <div>
                        <div className="location-name">{locObj.name}</div>
                        <div className="location-coords">Lat: {record.latitud} | Lon: {record.longitud}</div>
                      </div>

                      <span className={`status-tag ${alertClass}`}>
                        {record.nivel_alerta === 0 && <CheckCircle2 size={12} />}
                        {record.nivel_alerta === 1 && <AlertTriangle size={12} />}
                        {record.nivel_alerta === 2 && <ShieldAlert size={12} />}
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

                      <div className="metric-item">
                        <div className="metric-item-head">
                          <Wind size={14} color="#fbbf24" /> Ráfagas Viento
                        </div>
                        <div className="metric-item-val">{record.rafagas_viento} <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>km/h</span></div>
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
                        onClick={() => setActiveLocationForForecast(locObj)}
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
              })}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="table-container">
              {recentAlerts.length === 0 ? (
                <div className="empty-box">
                  <CheckCircle2 size={40} color="#34d399" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <h3>Sin Alertas Registradas</h3>
                  <p>No se han detectado eventos moderados o severos recientemente.</p>
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
          )}

          {activeTab === 'history' && (
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
          )}
        </>
      )}

      {/* FOOTER */}
      <footer className="app-footer">
        <div>
          ClimaAlert Dashboard v2.1 — Conectado a Supabase PostgreSQL & Open-Meteo API
        </div>
        {lastUpdated && (
          <div>
            Última sincro: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </footer>
    </div>
  )
}
