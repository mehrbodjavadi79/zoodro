import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface DirectionsModalProps {
  onClose: () => void;
  vendorLocation: { lat: number; lng: number };
  userLocation: [number, number] | null;
}

const DirectionsModal: React.FC<DirectionsModalProps> = ({ 
  onClose, 
  vendorLocation, 
  userLocation 
}) => {
  const handleGoogleMaps = () => {
    const origin = userLocation ? `${userLocation[0]},${userLocation[1]}` : '';
    const destination = `${vendorLocation.lat},${vendorLocation.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.location.href = url;
  };

  const handleNeshan = () => {
    const origin = userLocation ? `${userLocation[0]},${userLocation[1]}` : '';
    const destination = `${vendorLocation.lat},${vendorLocation.lng}`;
    const url = `https://nshn.ir/maps?origin=${origin}&destination=${destination}&type=drive`;
    window.location.href = url;
  };

  const handleWaze = () => {
    const destination = `${vendorLocation.lat},${vendorLocation.lng}`;
    const url = `https://waze.com/ul?ll=${destination}&navigate=yes`;
    window.location.href = url;
  };

  const handleBalad = () => {
    const url = `https://balad.ir/location?latitude=${vendorLocation.lat}&longitude=${vendorLocation.lng}&zoom=16.5`;
    window.location.href = url;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container directions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="back-button" onClick={onClose}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>انتخاب مسیریاب</h2>
        </div>
        
        <div className="modal-body directions-options">
          <button 
            className="direction-option google-maps" 
            onClick={handleGoogleMaps}
          >
            <div className="direction-icon">
              <img 
                src="/googlemaps.png" 
                alt="Google Maps"
                width="24"
                height="24"
              />
            </div>
            <div className="direction-text">
              <h3>گوگل مپ</h3>
              <p>مسیریابی با Google Maps</p>
            </div>
          </button>
          
          <button 
            className="direction-option neshan" 
            onClick={handleNeshan}
          >
            <div className="direction-icon">
              <img 
                src="/neshan.png" 
                alt="Neshan"
                width="24"
                height="24"
              />
            </div>
            <div className="direction-text">
              <h3>نشان</h3>
              <p>مسیریابی با نشان</p>
            </div>
          </button>

          <button 
            className="direction-option waze" 
            onClick={handleWaze}
          >
            <div className="direction-icon">
              <img 
                src="/waze.png" 
                alt="Waze"
                width="24"
                height="24"
              />
            </div>
            <div className="direction-text">
              <h3>ویز</h3>
              <p>مسیریابی با Waze</p>
            </div>
          </button>

          <button 
            className="direction-option balad" 
            onClick={handleBalad}
          >
            <div className="direction-icon">
              <img 
                src="/balad.png" 
                alt="Balad"
                width="24"
                height="24"
              />
            </div>
            <div className="direction-text">
              <h3>بلد</h3>
              <p>مسیریابی با بلد</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectionsModal; 