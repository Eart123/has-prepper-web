import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Home, Plus, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface MapLayer {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  minZoom: number;
}

const MAP_LAYERS: MapLayer[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 0,
  },
  {
    id: 'osm-hot',
    name: 'OSM Humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors, Tiles courtesy of Humanitarian OpenStreetMap Team',
    maxZoom: 19,
    minZoom: 0,
  },
  {
    id: 'cartodb',
    name: 'CartoDB Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors, © CARTO',
    maxZoom: 19,
    minZoom: 0,
  },
  {
    id: 'cartodb-dark',
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors, © CARTO',
    maxZoom: 19,
    minZoom: 0,
  },
];

const OFFLINE_TILE_URL = '/tiles/{z}/{x}/{y}.png';

export const Maps: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [zoom, setZoom] = useState(5);
  const [center, setCenter] = useState<[number, number]>([39.0, 35.0]);
  const [markers, setMarkers] = useState<Array<{ id: string; lat: number; lng: number; name: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    import('leaflet').then(L => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setLeaflet(L);
    });
  }, []);

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return;

    const L = leaflet;
    const map = L.map(mapRef.current!, {
      center,
      zoom,
      zoomControl: false,
      preferCanvas: true,
    });

    const layer = MAP_LAYERS[currentLayer];
    const tileUrl = offlineMode ? OFFLINE_TILE_URL : layer.url;

    L.tileLayer(tileUrl, {
      attribution: layer.attribution,
      maxZoom: layer.maxZoom,
      minZoom: layer.minZoom,
      subdomains: 'abc',
      detectRetina: true,
    }).addTo(map);

    // Add offline indicator control
    const offlineControl = L.control({ position: 'topright' });
    offlineControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      div.style.backgroundColor = 'white';
      div.style.padding = '8px 12px';
      div.style.borderRadius = '4px';
      div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      div.style.fontSize = '12px';
      div.style.fontFamily = 'Verdana, Tahoma, sans-serif';
      div.innerHTML = offlineMode
        ? '📴 Çevrimdışı Mod (Önbellekli Haritalar)'
        : '🌐 Çevrimiçi';
      div.style.color = offlineMode ? '#B00000' : '#006699';
      div.style.fontWeight = 'bold';
      return div;
    };
    offlineControl.addTo(map);

    // Add existing markers
    markers.forEach(marker => {
      L.marker([marker.lat, marker.lng])
        .bindPopup(`<b>${marker.name}</b>`)
        .addTo(map);
    });

    map.on('moveend', () => {
      const c = map.getCenter();
      setCenter([c.lat, c.lng]);
      setZoom(map.getZoom());
    });

    map.on('zoomend', () => {
      setZoom(map.getZoom());
    });

    map.on('click', (e: any) => {
      if (e.originalEvent.shiftKey) {
        handleAddMarker(e);
      }
    });

    mapInstanceRef.current = map;
  }, [leaflet, currentLayer, offlineMode]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); setOfflineMode(false); };
    const handleOffline = () => { setIsOnline(false); setOfflineMode(true); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update map when layer changes
  useEffect(() => {
    if (!leaflet || !mapInstanceRef.current) return;
    const L = leaflet;
    const map = mapInstanceRef.current;

    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const layerConfig = MAP_LAYERS[currentLayer];
    const tileUrl = offlineMode ? OFFLINE_TILE_URL : layerConfig.url;

    L.tileLayer(tileUrl, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      minZoom: layerConfig.minZoom,
      subdomains: 'abc',
    }).addTo(map);
  }, [leaflet, currentLayer, offlineMode]);

  const handleLayerChange = (index: number) => {
    setCurrentLayer(index);
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current && zoom < MAP_LAYERS[currentLayer].maxZoom) {
      mapInstanceRef.current.setZoom(zoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current && zoom > MAP_LAYERS[currentLayer].minZoom) {
      mapInstanceRef.current.setZoom(zoom - 1);
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([39.0, 35.0], 5);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([latitude, longitude], 13);
        leaflet.marker([latitude, longitude])
          .bindPopup('📍 Mevcut Konumunuz')
          .addTo(mapInstanceRef.current)
          .openPopup();
      }
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const results = await response.json();
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lon)], 12);
        leaflet.marker([parseFloat(lat), parseFloat(lon)])
          .bindPopup(`<b>${display_name}</b>`)
          .addTo(mapInstanceRef.current)
          .openPopup();
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleAddMarker = (e: any) => {
    const { lat, lng } = e.latlng;
    const name = prompt('Bu konum için bir isim girin:');
    if (name) {
      const newMarker = { id: Date.now().toString(), lat, lng, name };
      setMarkers(prev => [...prev, newMarker]);
      if (mapInstanceRef.current && leaflet) {
        leaflet.marker([lat, lng])
          .bindPopup(`<b>${name}</b>`)
          .addTo(mapInstanceRef.current);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] relative">
      <div
        ref={mapRef}
        className="absolute inset-0 z-0"
      />

      {/* Top Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-2 justify-center">
        <div className="bg-white border border-has-border rounded-lg shadow-lg p-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Konum ara (örn: Ankara, İstanbul)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="px-3 py-1 text-sm border border-has-border rounded focus:outline-none focus:ring-2 focus:ring-has-blue w-64"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1 bg-has-blue text-white text-sm rounded hover:bg-[#00527a] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-has-border rounded-lg shadow-lg p-2 flex items-center gap-1">
          {MAP_LAYERS.map((layer, index) => (
            <button
              key={layer.id}
              onClick={() => handleLayerChange(index)}
              className={cn(
                'px-3 py-1 text-xs rounded transition-colors whitespace-nowrap',
                currentLayer === index
                  ? 'bg-has-blue text-white'
                  : 'text-has-text hover:bg-has-cardBg'
              )}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls */}
      <div className="absolute right-3 top-48 z-10 flex flex-col gap-2">
        <div className="bg-white border border-has-border rounded-lg shadow-lg p-2 flex flex-col gap-1">
          <button onClick={handleZoomIn} className="p-2 text-has-text hover:bg-has-cardBg rounded transition-colors" aria-label="Yaklaştır">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={handleZoomOut} className="p-2 text-has-text hover:bg-has-cardBg rounded transition-colors" aria-label="Uzaklaştır">
            <Minus className="w-5 h-5" />
          </button>
          <button onClick={handleResetView} className="p-2 text-has-text hover:bg-has-cardBg rounded transition-colors" aria-label="Türkiye görünümü">
            <Home className="w-5 h-5" />
          </button>
          <button onClick={handleLocate} className="p-2 text-has-text hover:bg-has-cardBg rounded transition-colors" aria-label="Konumumu bul">
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white border border-has-border rounded-lg shadow-lg p-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-has-textMuted">Zoom: {zoom}</span>
            <input
              type="range"
              min={MAP_LAYERS[currentLayer].minZoom}
              max={MAP_LAYERS[currentLayer].maxZoom}
              value={zoom}
              onChange={(e) => mapInstanceRef.current?.setZoom(parseInt(e.target.value))}
              className="w-24 accent-has-blue"
            />
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap justify-center gap-2">
        <div className="bg-white/90 backdrop-blur-sm border border-has-border rounded-lg shadow-lg p-3 text-xs text-has-textMuted max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Harita: <strong>{MAP_LAYERS[currentLayer].name}</strong></span>
            <span>•</span>
            <span>Koordinat: <strong>{center[0].toFixed(4)}, {center[1].toFixed(4)}</strong></span>
            <span>•</span>
            <span>Zoom: <strong>{zoom}</strong></span>
            <span>•</span>
            <span className={cn(isOnline ? 'text-green-600' : 'text-red-600')}>
              {isOnline ? '🌐 Çevrimiçi' : '📴 Çevrimdışı (Önbellekli)'}
            </span>
          </div>
          <div className="mt-1 text-has-textMuted">
            {MAP_LAYERS[currentLayer].attribution}
          </div>
        </div>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-slide-down">
            <MapPin className="w-4 h-4" />
            <span>Çevrimdışı mod - Önbellekli harita döşemeleri kullanılıyor. Yeni bölgeler yüklenmeyebilir.</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .leaflet-container { font-family: Verdana, Tahoma, sans-serif; }
        .leaflet-popup-content-wrapper { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .leaflet-popup-content { margin: 8px 12px; font-family: Verdana, Tahoma, sans-serif; font-size: 13px; }
      `}</style>
    </div>
  );
};