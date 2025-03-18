import React, { useEffect, useMemo, memo } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createCustomIcon, createUserLocationIcon } from '../utils/mapUtils';

// Fix Leaflet icon issue in React
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

interface Vendor {
  lat: number;
  lng: number;
  name: string;
  off: number;
  max: number | null;
  min: number | null;
}

interface MarkerManagerProps {
  vendors: Vendor[];
  userLocation: [number, number] | null;
}

// Create a custom offer icon with the discount text
const createCustomOfferIcon = (discount: number): L.DivIcon => {
  const normalizedDiscount = discount / 100;  
  const hue = 120; // Green
  const saturation = 60 + (normalizedDiscount * 40); // 60-100%
  const lightness = 60 - (normalizedDiscount * 35); // 60-25%
  
  const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  
  return L.divIcon({
    className: 'offer-marker',
    html: `
      <div class="offer-marker-container">
        <div class="offer-marker-icon" style="background-color:${backgroundColor};">
          <span class="offer-marker-text" style="font-family: 'Vazirmatn', 'Tahoma', sans-serif;">٪${discount}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};


const formatOfferInfo = (max: number | null, min: number | null): string => {
  if (max && min) {
    return `حداقل خرید ${min/10} ت - حداکثر ${max/10} ت`;
  } else if (max) {
    return `حداکثر ${max/10} ت`;
  } else if (min) {
    return `حداقل خرید ${min/10} ت`;
  }
  return "نامحدود";
};

// Memoized individual vendor marker component
const VendorMarker = memo(({ vendor, icon }: { vendor: Vendor; icon: L.Icon }) => {
  // Create a custom offer icon if there's a discount
  const markerIcon = vendor.off !== null && vendor.off !== undefined
    ? createCustomOfferIcon(vendor.off)
    : icon;
    
  const showNotification = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.fontFamily = 'Vazir, Tahoma, sans-serif';
    notification.style.direction = 'rtl';
    notification.textContent = 'این قابلیت در حال حاضر در دسترس نیست';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  };

  const offerInfo = formatOfferInfo(vendor.max, vendor.min);
    
  return (
    <Marker 
      position={[vendor.lat, vendor.lng]}
      icon={markerIcon}
    >
      <Popup className="custom-popup" closeButton={false}>
        <div className="marker-info" dir="rtl" style={{ width: '100%' }}>
          <div className="marker-header" style={{ padding: '5px 10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{ margin: '5px 0', fontSize: '16px' }}>{vendor.name}</h2>
          </div>
          <div className="marker-content">
            <div className="marker-actions">
              <button className="action-button directions-btn" onClick={showNotification}>
                <i className="fa fa-directions"></i>
              </button>
              <h3>{offerInfo}</h3>
              <button className="action-button share-btn" onClick={showNotification}>
                <i className="fa fa-share-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

// Memoized user location marker component
const UserLocationMarker = memo(({ position, icon }: { position: [number, number]; icon: L.Icon }) => (
  <Marker 
    position={position}
    icon={icon}
  >
  </Marker>
));

const MarkerManager: React.FC<MarkerManagerProps> = ({ vendors = [], userLocation }) => {
  const map = useMap();
  
  // Fix the Leaflet icon issue
  useEffect(() => {
    // This code needs to run once when the app starts
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconUrl: icon,
      iconRetinaUrl: iconRetina,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);
  
  // Create custom icons - memoized to prevent recreation on each render
  const customIcon = useMemo(() => createCustomIcon(), []);
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);
  
  // Filter valid vendors - memoized to prevent recalculation on each render
  const validVendors = useMemo(() => {
    if (!Array.isArray(vendors)) return [];
    return vendors.filter(vendor => 
      vendor && 
      typeof vendor === 'object' && 
      typeof vendor.lat === 'number' && 
      typeof vendor.lng === 'number'
    );
  }, [vendors]);
  
  return (
    <>
      {validVendors.map((vendor, index) => (
        <VendorMarker 
          key={`vendor-${index}-${vendor.lat}-${vendor.lng}`}
          vendor={vendor}
          icon={customIcon}
        />
      ))}
      
      {userLocation && Array.isArray(userLocation) && userLocation.length === 2 && (
        <UserLocationMarker 
          position={userLocation}
          icon={userLocationIcon as unknown as L.Icon}
        />
      )}
    </>
  );
};

export default memo(MarkerManager); 