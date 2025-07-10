/**
 * Service for fetching vendor data from the API
 */

const API_BASE_URL = 'https://zooodro-be-go.liara.run';

interface VendorResponse {
  vendors: {
    lat: number;
    lng: number;
    name: string;
    off: string;
  }[];
  requestId: string;
}

/**
 * Fetches vendors near a specific location
 * @param top_left_lat - Top left latitude
 * @param top_left_lng - Top left longitude
 * @param bottom_right_lat - Bottom right latitude
 * @param bottom_right_lng - Bottom right longitude
 * @param requestId - Unique identifier for this request
 * @returns Promise resolving to vendor data with request ID
 */
export async function fetchVendorsNearLocation(
  top_left_lat: number, 
  top_left_lng: number, 
  bottom_right_lat: number, 
  bottom_right_lng: number,
  requestId: string
): Promise<VendorResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors?top_left_lat=${top_left_lat}&top_left_lng=${top_left_lng}&bottom_right_lat=${bottom_right_lat}&bottom_right_lng=${bottom_right_lng}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return { ...data, requestId };
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
} 