import React from 'react'
import { Search, X, RefreshCw } from 'lucide-react'

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  searching,
  onSearchSubmit,
  onSelectResult
}) {
  return (
    <form className="search-section" onSubmit={onSearchSubmit}>
      <div className="search-input-wrapper">
        <Search size={20} className="search-input-icon" />
        <input 
          type="text" 
          className="search-input"
          placeholder="🔎 Buscar ciudad o zona (ej. Rosario, Palermo)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <X 
            size={18} 
            style={{ position: 'absolute', right: '96px', cursor: 'pointer', color: '#9ca3af' }}
            onClick={() => { setSearchQuery(''); setSearchResults([]); }}
          />
        )}
        <button type="submit" className="search-btn">
          {searching ? <RefreshCw size={16} className="spinning" /> : 'Buscar'}
        </button>
      </div>

      {/* Dropdown de resultados de búsqueda */}
      {(searching || searchResults.length > 0 || (searchQuery.trim().length >= 2 && searchResults.length === 0)) && (
        <div className="search-results-dropdown">
          {searching && (
            <div className="search-result-info">
              <RefreshCw size={16} className="spinning" /> Buscando ubicaciones para "{searchQuery}"...
            </div>
          )}

          {!searching && searchResults.length > 0 && searchResults.map((res) => (
            <div 
              key={res.id} 
              className="search-result-item"
              onClick={() => onSelectResult(res)}
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

          {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <div className="search-result-info">
              ❌ No se encontraron ubicaciones para "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </form>
  )
}
