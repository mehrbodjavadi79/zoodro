/**
 * Utility functions for map operations
 */
import L from 'leaflet';

/**
 * Creates a custom icon for vendors
 * @returns Leaflet icon instance
 */
export function createCustomIcon(): L.Icon {
  return L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
  });
}

/**
 * Creates a user location icon
 * @returns Leaflet div icon instance
 */
export function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="pulse-dot">
        <div class="pulse-core"></div>
        <div class="pulse-circle"></div>
        <div class="pulse-circle pulse-circle-2"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

/**
 * Creates a custom icon for vendors with offers
 * @returns Leaflet icon instance
 */
export function createOfferIcon(): L.DivIcon {
  return L.divIcon({
    className: 'offer-marker',
    html: `
      <div class="offer-marker-container">
        <div class="offer-marker-icon">
          <img src="https://cdn-icons-png.flaticon.com/512/3448/3448612.png" alt="Offer" />
        </div>
        <div class="offer-marker-badge">
          <div class="offer-marker-pulse"></div>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  });
}

/**
 * Adds custom map styles
 */
export function addMapStyles(): void {
  // This function is kept for compatibility with the original code
  // In React, we handle styles through CSS and component props
}

/**
 * Calculates the distance between two points
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}


const TILE_SIZE = 256;

function lonToX(lon: number, z: number): number {
    const total_width = TILE_SIZE * Math.pow(2, z);
    return (lon + 180) / 360 * total_width;
}

function xToLon(x: number, z: number): number {
    const total_width = TILE_SIZE * Math.pow(2, z);
    return x / total_width * 360 - 180;
}

function latToY(lat: number, z: number): number {
    const total_height = TILE_SIZE * Math.pow(2, z);
    const lat_rad = lat * Math.PI / 180;
    return total_height * (0.5 - 0.5 * Math.asinh(Math.tan(lat_rad)) / Math.PI);
}

function yToLat(y: number, z: number): number {
    const total_height = TILE_SIZE * Math.pow(2, z);
    const fraction = y / total_height;
    const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * fraction)));
    return lat_rad * 180 / Math.PI;
}

interface CornerCoordinates {
    topLeft: { lat: number; lon: number };
    topRight: { lat: number; lon: number };
    bottomLeft: { lat: number; lon: number };
    bottomRight: { lat: number; lon: number };
}

export function getCornerCoordinates(
    lat_center: number,
    lon_center: number,
    zoom_level: number,
    width: number,
    height: number
): CornerCoordinates {
    const x_center = lonToX(lon_center, zoom_level);
    const y_center = latToY(lat_center, zoom_level);
    const half_width = width / 2;
    const half_height = height / 2;
    const topLeftX = x_center - half_width;
    const topLeftY = y_center - half_height;
    const topRightX = x_center + half_width;
    const topRightY = y_center - half_height;
    const bottomLeftX = x_center - half_width;
    const bottomLeftY = y_center + half_height;
    const bottomRightX = x_center + half_width;
    const bottomRightY = y_center + half_height;
    const topLeftLon = xToLon(topLeftX, zoom_level);
    const topLeftLat = yToLat(topLeftY, zoom_level);
    const topRightLon = xToLon(topRightX, zoom_level);
    const topRightLat = yToLat(topRightY, zoom_level);
    const bottomLeftLon = xToLon(bottomLeftX, zoom_level);
    const bottomLeftLat = yToLat(bottomLeftY, zoom_level);
    const bottomRightLon = xToLon(bottomRightX, zoom_level);
    const bottomRightLat = yToLat(bottomRightY, zoom_level);
    return {
        topLeft: { lat: topLeftLat, lon: topLeftLon },
        topRight: { lat: topRightLat, lon: topRightLon },
        bottomLeft: { lat: bottomLeftLat, lon: bottomLeftLon },
        bottomRight: { lat: bottomRightLat, lon: bottomRightLon }
    };
}

/**
 * Converts degrees to radians
 * @param deg - Degrees
 * @returns Radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}; 