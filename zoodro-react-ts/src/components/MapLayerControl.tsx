import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

interface MapLayerControlProps {
  currentLayer: string;
  onLayerChange: (layer: string) => void;
  availableLayers: {
    [key: string]: {
      name: string;
      description: string;
    }
  };
}

const MapLayerControl: React.FC<MapLayerControlProps> = ({
  currentLayer,
  onLayerChange,
  availableLayers
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleLayerSelect = (layer: string) => {
    onLayerChange(layer);
    setIsOpen(false);
  };

  return (
    <div className="map-layer-control">
      <button 
        className="control-button layer-toggle" 
        onClick={toggleOpen}
        aria-label="تغییر لایه نقشه"
      >
        <FontAwesomeIcon icon={faLayerGroup} />
      </button>
      
      {isOpen && (
        <div className="layer-options">
          {Object.keys(availableLayers).map(layerKey => (
            <button
              key={layerKey}
              className={`layer-option ${currentLayer === layerKey ? 'active' : ''}`}
              onClick={() => handleLayerSelect(layerKey)}
            >
              {availableLayers[layerKey].name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapLayerControl; 