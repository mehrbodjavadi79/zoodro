import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faMinus, 
  faLocationCrosshairs, 
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocateUser: () => void;
  hasUserLocation: boolean;
  isLocating?: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onLocateUser,
  hasUserLocation,
  isLocating = false,
}) => {
  return (
    <>
      <div className="map-controls bottom">
        <button 
          className="control-button" 
          onClick={onZoomIn} 
          aria-label="بزرگ نمایی"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <button 
          className="control-button" 
          onClick={onZoomOut} 
          aria-label="کوچک‌ نمایی"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
        <button 
          className={`control-button ${hasUserLocation ? 'active' : ''} ${isLocating ? 'loading' : ''}`} 
          onClick={onLocateUser} 
          aria-label="موقعیت من"
          disabled={isLocating}
        >
          {isLocating ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faLocationCrosshairs} />
          )}
        </button>
      </div>
    </>
  );
};

export default MapControls; 