import React, { useEffect, useMemo, memo, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createCustomIcon, createUserLocationIcon } from '../utils/mapUtils';
import DirectionsModal from './DirectionsModal';

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
const createCustomOfferIcon = (discount: number, bounce: boolean): L.DivIcon => {
  const normalizedDiscount = discount / 100;  
  
  // Use a gradient from red-yellow to green based on discount value
  const hue = normalizedDiscount < 0.3 ? 40 - (normalizedDiscount * 100) : 120 - (normalizedDiscount * 10);
  const saturation = 70 + (normalizedDiscount * 30);
  const lightness = normalizedDiscount < 0.3 ? 55 : 50 - (normalizedDiscount * 30);
  
  const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const textColor = '#ffffff';
  const borderColor = `hsla(${hue}, ${saturation}%, ${lightness - 20}%, 0.8)`;
  
  const bounceClass = bounce ? 'bounce-marker' : '';

  const persianDiscount = discount.toLocaleString('fa-IR');
  
  return L.divIcon({
    className: `offer-marker ${bounceClass}`,
    html: `
      <div class="offer-marker-container">
        <div class="offer-marker-icon" style="background-color:${backgroundColor}; border: 1.5px solid ${borderColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
          <span class="offer-marker-text" style="font-family: 'Vazirmatn', 'Tahoma', sans-serif; color: ${textColor};">٪${persianDiscount}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const formatOfferInfo = (max: number | null, min: number | null): string => {
  const persianMax = max ? (max/10).toLocaleString('fa-IR') : null;
  const persianMin = min ? (min/10).toLocaleString('fa-IR') : null;
  if (max && min) {
    return `حداقل خرید ${persianMin} ت - حداکثر ${persianMax} ت`;
  } else if (max) {
    return `حداکثر ${persianMax} ت`;
  } else if (min) {
    return `حداقل خرید ${persianMin} ت`;
  }
  return "نامحدود";
};

// Memoized individual vendor marker component
const VendorMarker = memo(({ vendor, icon, userLocation }: { vendor: Vendor; icon: L.Icon; userLocation: [number, number] | null }) => {
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  
  // Create a custom offer icon if there's a discount
  const markerIcon = vendor.off !== null && vendor.off !== undefined
    ? createCustomOfferIcon(vendor.off, vendor.max === null && vendor.min === null && vendor.off >= 30)
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
  
  const openDirectionsModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDirectionsModal(true);
  };
    
  return (
    <>
      <Marker 
        position={[vendor.lat, vendor.lng]}
        icon={markerIcon}
      >
        <Popup className="custom-popup" closeButton={false}>
          <div className="marker-info" dir="rtl" style={{ width: '100%' }}>
            <div className="marker-header" style={{ padding: '5px 10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <h2 style={{ margin: '5px 0', fontSize: '16px' }}>{vendor.name} - {vendor.off.toLocaleString('fa-IR')}%</h2>
            </div>
            <div className="marker-content">
              <div className="marker-actions">
                <button className="action-button directions-btn" onClick={openDirectionsModal}>
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
      
      {showDirectionsModal && (
        <DirectionsModal
          onClose={() => setShowDirectionsModal(false)}
          vendorLocation={{ lat: vendor.lat, lng: vendor.lng }}
          userLocation={userLocation}
        />
      )}
    </>
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
          userLocation={userLocation}
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