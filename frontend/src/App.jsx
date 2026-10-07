import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { LOCATIONS } from './utils/weatherHelpers'

import Header from './components/Header'
import SearchBar from './components/SearchBar'
import Forecast24h from './components/Forecast24h'
import NavTabs from './components/NavTabs'
import LocationCard from './components/LocationCard'
import AlertsTable from './components/AlertsTable'
import HistoryTable from './components/HistoryTable'
import { AlertBanner, CustomLocationBanner } from './components/Banners'

export default function App() {
  const [activeTab, setActiveTab] = useState(null) // null | 'dashboard' | 'alerts' | 'history'
  
  const handleTabClick = (tab) => {
    setActiveTab(prev => prev === tab ? null : tab)
  }

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

      const { data: alertsData } = await supabase
        .from('alertas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      setRecentAlerts(alertsData || [])

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
    setForecast24h([])
    setLoadingForecast(true)

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=weather_code,temperature_2m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_gusts_10m,wind_direction_10m&timezone=auto&forecast_days=3`
      const res = await fetch(url)
      const data = await res.json()

      if (data && data.hourly) {
        const times = data.hourly.time || []
        const temps = data.hourly.temperature_2m || []
        const probs = data.hourly.precipitation_probability || []
        const precips = data.hourly.precipitation || []
        const codes = data.hourly.weather_code || []
        const gusts = data.hourly.wind_gusts_10m || []
        const dirs = data.hourly.wind_direction_10m || []

        let nowIndex = 0
        let todayYMD = ''

        if (data.current && data.current.time) {
          const currentIsoPrefix = data.current.time.substring(0, 13)
          todayYMD = data.current.time.split('T')[0]
          const idx = times.findIndex(t => t.startsWith(currentIsoPrefix))
          if (idx !== -1) nowIndex = idx
        } else {
          const now = new Date()
          todayYMD = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
          nowIndex = now.getHours()
        }

        const todayDateObj = new Date(todayYMD + 'T00:00:00')
        const tomorrowDateObj = new Date(todayDateObj)
        tomorrowDateObj.setDate(tomorrowDateObj.getDate() + 1)
        const tomorrowYMD = `${tomorrowDateObj.getFullYear()}-${String(tomorrowDateObj.getMonth()+1).padStart(2,'0')}-${String(tomorrowDateObj.getDate()).padStart(2,'0')}`

        const hourlyItems = []
        for (let i = nowIndex; i < Math.min(nowIndex + 24, times.length); i++) {
          const rawTime = times[i]
          const itemYMD = rawTime.split('T')[0]
          const timePart = rawTime.split('T')[1] || ''
          const hourNum = parseInt(timePart.split(':')[0], 10)
          const isNight = hourNum >= 19 || hourNum < 6

          let dayCategory = 'hoy'
          let dayLabel = 'Hoy'

          if (itemYMD === tomorrowYMD) {
            dayCategory = 'mañana'
            dayLabel = 'Mañana'
          } else if (itemYMD !== todayYMD) {
            const dateObj = new Date(rawTime)
            dayCategory = dateObj.toLocaleDateString('es-ES', { weekday: 'long' })
            dayLabel = dateObj.toLocaleDateString('es-ES', { weekday: 'short' })
          }

          hourlyItems.push({
            timeStr: timePart,
            hourNum,
            isNight,
            dayCategory,
            dayLabel,
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

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // 3. Buscar ubicaciones en tiempo real
  const executeSearch = useCallback(async (q) => {
    const query = (q || '').trim()
    if (query.length < 2) {
      setSearchResults([])
      return []
    }
    setSearching(true)
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=es&format=json`)
      const data = await res.json()
      const results = data.results || []
      setSearchResults(results)
      return results
    } catch (e) {
      console.error('Error buscando ubicación:', e)
      setSearchResults([])
      return []
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(() => {
      executeSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, executeSearch])

  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const results = await executeSearch(searchQuery)
    if (results && results.length > 0) {
      handleSelectSearchResult(results[0])
    }
  }

  const handleSelectSearchResult = (result) => {
    const name = `${result.name}${result.admin1 ? `, ${result.admin1}` : ''} (${result.country || ''})`
    const locObj = {
      name,
      lat: result.latitude,
      lon: result.longitude
    }

    setForecast24h([])
    setSelectedCustomLocation(locObj)
    setActiveLocationForForecast(locObj)
    fetch24hForecast(locObj)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSelectLocationBtn = (loc) => {
    setForecast24h([])
    setActiveLocationForForecast(loc)
    fetch24hForecast(loc)
  }

  const activeCriticalAlert = recentAlerts.find(a => {
    const hours = (new Date() - new Date(a.created_at)) / (1000 * 60 * 60)
    return hours <= 6
  })

  const availableLocations = [...LOCATIONS, ...(selectedCustomLocation ? [selectedCustomLocation] : [])]

  return (
    <div className="app-container">
      {/* HEADER */}
      <Header 
        refreshing={refreshing} 
        loading={loading} 
        onRefresh={() => fetchData(true)} 
      />

      {/* BUSCADOR DE ZONAS */}
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        searching={searching}
        onSearchSubmit={handleSearchSubmit}
        onSelectResult={handleSelectSearchResult}
      />

      {/* BANNER DE ZONA BUSCADA */}
      <CustomLocationBanner 
        selectedCustomLocation={selectedCustomLocation}
        onResetLocation={() => {
          setSelectedCustomLocation(null)
          handleSelectLocationBtn(LOCATIONS[0])
        }}
      />

      {/* BANNER DE ALERTA CRÍTICA RECIENTE */}
      <AlertBanner activeCriticalAlert={activeCriticalAlert} />

      {/* PREVISIONES A 24 HORAS */}
      <Forecast24h 
        activeLocation={activeLocationForForecast}
        availableLocations={availableLocations}
        onSelectLocation={handleSelectLocationBtn}
        forecast24h={forecast24h}
        loadingForecast={loadingForecast}
      />

      {/* PESTAÑAS DE NAVEGACIÓN (MENÚ INTERACTIVO) */}
      <NavTabs 
        activeTab={activeTab} 
        onTabClick={handleTabClick} 
        alertsCount={recentAlerts.length} 
      />

      {/* CONTENIDO DESPLEGABLE SOLO SI SE SELECCIONA UNA OPCIÓN */}
      {activeTab !== null && (
        <div className="tab-content-container">
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
                    return (
                      <LocationCard 
                        key={locObj.name}
                        locObj={locObj}
                        record={record}
                        onSelectForecast={handleSelectLocationBtn}
                      />
                    )
                  })}
                </div>
              )}

              {activeTab === 'alerts' && <AlertsTable recentAlerts={recentAlerts} />}

              {activeTab === 'history' && <HistoryTable allRecords={allRecords} />}
            </>
          )}
        </div>
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
