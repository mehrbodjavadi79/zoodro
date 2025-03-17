/**
 * Utility functions for handling geolocation
 */

interface LocationError {
  code: number;
  message: string;
}

interface ErrorDetails {
  errorMessage: string;
  instructions: string;
}

/**
 * Gets the user's current location
 * @returns Promise resolving to the user's position
 */
export function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}

/**
 * Gets detailed error information for location errors
 * @param error - The geolocation error
 * @returns Object with error message and instructions
 */
export function getLocationErrorDetails(error: GeolocationPositionError | Error): ErrorDetails {
  let errorMessage = 'Unable to retrieve your location';
  let instructions = 'Please enable location services in your browser settings and try again.';
  
  if ('code' in error) {
    // This is a GeolocationPositionError
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        errorMessage = 'Location access denied';
        instructions = 'You have denied access to your location. Please update your browser settings to allow location access.';
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMessage = 'Location information unavailable';
        instructions = 'Your location information is currently unavailable. Please try again later.';
        break;
      case 3: // TIMEOUT
        errorMessage = 'Location request timed out';
        instructions = 'The request to get your location timed out. Please try again.';
        break;
    }
  }
  
  return { errorMessage, instructions };
} 