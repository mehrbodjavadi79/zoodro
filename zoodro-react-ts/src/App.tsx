import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import SearchBar from './components/SearchBar';
import MapControls from './components/MapControls';
import MapLayerControl from './components/MapLayerControl';
import MarkerManager from './components/MarkerManager';
import PermissionModal from './components/PermissionModal';
import { debounce, getCornerCoordinates } from './utils/mapUtils';
import { fetchVendorsNearLocation } from './api/vendorService';

// Default coordinates (Tehran)
const DEFAULT_CENTER: [number, number] = [35.6892, 51.3890];

// Zoom level limits
const MIN_ZOOM_LEVEL = 14;
const MAX_ZOOM_LEVEL = 18;
const USER_LOCATION_ZOOM_LEVEL = 16;

// Default zoom (constrained within limits)
const DEFAULT_ZOOM = Math.min(Math.max(8, MIN_ZOOM_LEVEL), MAX_ZOOM_LEVEL);

// Map layer URLs
const MAP_LAYERS = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  googleLike: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  googleSatellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Layer names and descriptions for UI
const MAP_LAYER_NAMES = {
  osm: {
    name: "استاندارد",
    description: "نقشه استاندارد OpenStreetMap"
  },
  googleLike: {
    name: "خیابان‌ها",
    description: "نقشه خیابان‌ها با سبک گوگل"
  },
  googleSatellite: {
    name: "ماهواره‌ای",
    description: "تصاویر ماهواره‌ای"
  }
};

const App: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [currentMapLayer, setCurrentMapLayer] = useState<string>('googleLike');
  const [isLocating, setIsLocating] = useState(false);
  const moveEndTimeoutRef = useRef<number | null>(null);
  const latestRequestIdRef = useRef<string>('');

  useEffect(() => {
    fetchVendors();
  }, [mapCenter]);

  const fetchVendors = async () => {
    try {
      const cornerCoordinates = getCornerCoordinates(
        mapCenter[0], 
        mapCenter[1], 
        zoom, 
        window.innerWidth, 
        window.innerHeight
      );
      
      const requestId = Date.now().toString();
      latestRequestIdRef.current = requestId;
      
      const data = await fetchVendorsNearLocation(
        cornerCoordinates.topLeft.lat,
        cornerCoordinates.topLeft.lon,
        cornerCoordinates.bottomRight.lat,
        cornerCoordinates.bottomRight.lon,
        requestId,
      );
      
      if (data.requestId === requestId) {
        if (data && Array.isArray(data.vendors)) {
          setVendors(data.vendors);
        } else {
          console.error('Invalid vendor data received:', data);
        }
      } else {
        console.log('Ignoring stale response from earlier request');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const initUserLocation = useCallback(() => {
    setIsLocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setZoom(USER_LOCATION_ZOOM_LEVEL);
          setShowPermissionModal(false);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setShowPermissionModal(true);
          setIsLocating(false);
        }
      );
    } else {
      console.log("hiuowehflerhnljwbb  22");
      setShowPermissionModal(true);
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    initUserLocation();
  }, [initUserLocation]);
  
  // Handle search
  const handleSearch = useCallback((searchTerm: string) => {
    // In a real app, this would call an API with the search term
    console.log('Searching for:', searchTerm);
  }, []);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 1, MAX_ZOOM_LEVEL));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 1, MIN_ZOOM_LEVEL));
  }, []);

  // Handle user location
  const handleLocateUser = useCallback(() => {
    initUserLocation();
    setZoom(USER_LOCATION_ZOOM_LEVEL);
  }, [initUserLocation]);

  // Handle map layer change
  const handleMapLayerChange = useCallback((layer: string) => {
    setCurrentMapLayer(layer);
  }, []);

  // Debounced map center change handler
  const debouncedSetMapCenter = useMemo(
    () => debounce((center: [number, number]) => {
      setMapCenter(center);
    }, 300),
    []
  );

  // Map event handlers component
  const MapEvents = () => {
    const map = useMap();
    const updateTimeoutRef = useRef<number | null>(null);
    
    // Initial setup
    useEffect(() => {
      // Set zoom constraints
      map.setMinZoom(MIN_ZOOM_LEVEL);
      map.setMaxZoom(MAX_ZOOM_LEVEL);
      
      // Set initial view
      map.setView(mapCenter, zoom, { animate: false });
      
      return () => {
        // Clear any pending updates
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Handle external updates to center/zoom
    useEffect(() => {
      map.setView(mapCenter, zoom, { animate: false });
    }, [map, mapCenter, zoom]);
    
    // Handle map interactions
    useEffect(() => {
      const updateStateFromMap = () => {
        // Ensure we're not scheduling multiple updates
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        // Use a short delay to batch updates
        updateTimeoutRef.current = window.setTimeout(() => {
          const center = map.getCenter();
          const newZoom = map.getZoom();
          
          setMapCenter([center.lat, center.lng]);
          if (newZoom !== zoom) {
            setZoom(newZoom);
          }
          
          updateTimeoutRef.current = null;
        }, 100);
      };
      
      map.on('moveend', updateStateFromMap);
      map.on('zoomend', updateStateFromMap);
      
      return () => {
        map.off('moveend', updateStateFromMap);
        map.off('zoomend', updateStateFromMap);
        
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    }, [map, zoom]);
    
    return null;
  };

  return (
    <div className="App">
      {/* <SearchBar onSearch={handleSearch} hasUserLocation={!!userLocation} /> */}
      
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100vh', width: '100%' }}
        zoomControl={false}
        fadeAnimation={false}
        zoomAnimation={false}
        markerZoomAnimation={false}
        preferCanvas={true}
        zoomSnap={0.0}
        zoomDelta={0.25}
        wheelPxPerZoomLevel={120}
        touchZoom={true}
        doubleClickZoom={false}
        bounceAtZoomLimits={false}
      >
        <TileLayer
          attribution={MAP_LAYERS[currentMapLayer as keyof typeof MAP_LAYERS].attribution}
          url={MAP_LAYERS[currentMapLayer as keyof typeof MAP_LAYERS].url}
          className="no-flash-tile-layer"
          keepBuffer={8} 
          updateWhenZooming={false}
          updateWhenIdle={true}
        />
        
        <MarkerManager 
          vendors={vendors} 
          userLocation={userLocation}
        />
        
        <MapEvents />
      </MapContainer>
      
      {showPermissionModal && (
        <PermissionModal 
          onClose={() => setShowPermissionModal(false)} 
          onRetry={initUserLocation} 
        />
      )}

      <MapControls 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocateUser={handleLocateUser}
        hasUserLocation={!!userLocation}
        isLocating={isLocating}
      />

      {/* SEO Content - Hidden but readable by search engines */}
      <div className="seo-content" style={{ display: 'none' }}>
        <h1>زودرو - نقشه تخفیف‌های فودرو (foodro map)</h1>
        <p>
          نقشه فودرو یا زودرو مکان‌یابی برای پیدا کردن بهترین تخفیف‌های رستوران، کافه و فست‌فود در اطراف شما است.
          با استفاده از سرویس foodro map (نقشه فودرو) می‌توانید به راحتی تخفیف‌های نزدیک خود را پیدا کنید.
          سایت zooodro.ir به شما کمک می‌کند بهترین تخفیف فودرو را بیابید.
        </p>
        <h2>تخفیف فودرو - بهترین پیشنهادات نزدیک شما</h2>
        <p>
          با زودرو، دیگر نیازی به جستجوی طولانی برای یافتن تخفیف ندارید. تمام تخفیف‌های فودرو روی نقشه به شما نمایش داده می‌شوند.
          foodro map را امتحان کنید و از مزایای تخفیف فودرو بهره‌مند شوید.
        </p>
        <h2>اپلیکیشن تخفیف غذا | نقشه رستوران های اطراف من</h2>
        <p>
          زودرو یا فودمپ بهترین نقشه تخفیف برای پیدا کردن رستوران های اطراف من با تخفیف است.
          تخفیف کافه، تخفیف فست فود و تخفیف رستوران همه در یک نقشه جمع شده‌اند.
          کوپن تخفیف رستوران‌ها را روی نقشه پیدا کنید و از غذای ارزان لذت ببرید.
        </p>
        <h3>Food Discount Map | Restaurant Deals Near Me</h3>
        <p>
          Zoodro is the best food discount map application for finding restaurant deals and cafe offers near you.
          Discover the closest food discounts on the map with our discount locator service.
          Find pizza discounts, fast food offers, and affordable food options all in one place.
        </p>
        <h3>نزدیکترین تخفیف غذا | Best Food Discounts</h3>
        <p>
          با استفاده از نقشه زودرو، نزدیکترین تخفیف‌های غذا را پیدا کنید. این سرویس تخفیف سفارش غذا 
          به شما کمک می‌کند در هزینه‌های روزانه صرفه‌جویی کنید. بهترین پیشنهادات غذایی تهران همه در زودرو.
        </p>
      </div>
    </div>
  );
};

export default App;
