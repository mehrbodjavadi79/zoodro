import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  hasUserLocation: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, hasUserLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };
  
  return (
    <form className="search-container" onSubmit={handleSubmit}>
      <FontAwesomeIcon 
        icon={hasUserLocation ? faLocationCrosshairs : faSearch} 
        className={`search-icon ${hasUserLocation ? 'location-active' : ''}`}
        style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <input
        type="text"
        className="search-input"
        placeholder="جستجوی مکان..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ paddingLeft: '30px', height: '16px', lineHeight: '30px' }}
      />
    </form>
  );
};

export default SearchBar; 