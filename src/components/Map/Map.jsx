import { useState } from 'react';
import { KINGDOMS } from '../../data/kingdoms';
import { useKingdomContext } from '../../contexts/KingdomContext';

// Визначення регіонів карти
const regions = {
  capital: {
    id: 'capital',
    name: 'Столиця',
    description: 'Величезне місто з замками та баштами. Тут ви знайдете торговців та квести.',
    type: 'місто',
    color: '#fdcb6e',
    hoverColor: '#ffd93d',
    path: 'M 20 30 L 35 25 L 40 35 L 30 45 L 20 40 Z',
  },
  darkForest: {
    id: 'darkForest',
    name: 'Темний ліс',
    description: 'Таємничий ліс, повний небезпек та пригод. Тут можна знайти рідкісні ресурси та полювати на монстрів.',
    type: 'ліс',
    color: '#00b894',
    hoverColor: '#00d4aa',
    path: 'M 50 15 L 70 20 L 75 40 L 65 50 L 55 45 L 50 30 Z',
  },
  forgottenMines: {
    id: 'forgottenMines',
    name: 'Забуті шахти',
    description: 'Темні підземні шахти з потужними ворогами. Тільки для досвідчених воїнів! Тут можна полювати на монстрів.',
    type: 'підземелля',
    color: '#e17055',
    hoverColor: '#ff7675',
    path: 'M 25 55 L 45 60 L 50 75 L 40 85 L 25 80 L 20 65 Z',
  },
};

export const Map = ({ selectedRegion, onSelectRegion }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const { getProvinceOwner } = useKingdomContext();

  const handleRegionClick = (regionId) => {
    if (onSelectRegion) {
      onSelectRegion(regionId);
    }
  };

  const handleRegionHover = (regionId) => {
    setHoveredRegion(regionId);
  };

  const handleRegionLeave = () => {
    setHoveredRegion(null);
  };

  const getKingdomForRegion = (regionId) => {
    const ownerKingdom = getProvinceOwner(regionId);
    return ownerKingdom ? KINGDOMS[ownerKingdom] : null;
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Текстурний фон */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <pattern id="texture" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="#ffffff" opacity="0.3" />
            <circle cx="10" cy="10" r="0.5" fill="#ffffff" opacity="0.2" />
            <circle cx="30" cy="30" r="0.5" fill="#ffffff" opacity="0.2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#texture)" />
        </svg>
      </div>

      {/* SVG-карта */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: 'drop-shadow(0 0 20px rgba(108, 92, 231, 0.3))' }}
      >
        {/* Фон карти */}
        <rect width="100" height="100" fill="#1a1a2e" />
        
        {/* Дороги між регіонами */}
        <g stroke="#6c5ce7" strokeWidth="0.3" opacity="0.4" fill="none">
          <path d="M 30 35 L 50 30" />
          <path d="M 30 40 L 35 60" />
          <path d="M 60 35 L 45 65" />
        </g>

        {/* Регіон: Столиця */}
        <g
          className="map-region cursor-pointer transition-all duration-300"
          onClick={() => handleRegionClick('capital')}
          onMouseEnter={() => handleRegionHover('capital')}
          onMouseLeave={handleRegionLeave}
        >
          <path
            d={regions.capital.path}
            fill={
              selectedRegion === 'capital'
                ? regions.capital.hoverColor
                : hoveredRegion === 'capital'
                ? regions.capital.hoverColor
                : regions.capital.color
            }
            opacity={
              selectedRegion === 'capital' || hoveredRegion === 'capital' ? 0.9 : 0.7
            }
            stroke={
              selectedRegion === 'capital' ? '#fdcb6e' : hoveredRegion === 'capital' ? '#ffd93d' : 'transparent'
            }
            strokeWidth={selectedRegion === 'capital' ? 0.8 : hoveredRegion === 'capital' ? 0.5 : 0}
            className="transition-all duration-300"
            style={{
              filter: selectedRegion === 'capital' || hoveredRegion === 'capital' 
                ? 'drop-shadow(0 0 8px rgba(253, 203, 110, 0.8))' 
                : 'none',
            }}
          />
          {/* Кордон королівства */}
          {getKingdomForRegion('capital') && (
            <path
              d={regions.capital.path}
              fill="none"
              stroke={getKingdomForRegion('capital').color}
              strokeWidth="0.3"
              strokeDasharray="1,1"
              opacity="0.8"
              className="kingdom-border animate-flag"
            />
          )}
          <text
            x="27.5"
            y="36"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="3.5"
            fontWeight="bold"
            className="pointer-events-none"
            style={{ textShadow: '0 0 4px rgba(0, 0, 0, 0.8)' }}
          >
            {regions.capital.name}
          </text>
          {/* Прапор королівства */}
          {getKingdomForRegion('capital') && (
            <text
              x="22"
              y="32"
              fontSize="4"
              className="pointer-events-none animate-flag"
            >
              {getKingdomForRegion('capital').flagEmoji}
            </text>
          )}
        </g>

        {/* Регіон: Темний ліс */}
        <g
          className="map-region cursor-pointer transition-all duration-300"
          onClick={() => handleRegionClick('darkForest')}
          onMouseEnter={() => handleRegionHover('darkForest')}
          onMouseLeave={handleRegionLeave}
        >
          <path
            d={regions.darkForest.path}
            fill={
              selectedRegion === 'darkForest'
                ? regions.darkForest.hoverColor
                : hoveredRegion === 'darkForest'
                ? regions.darkForest.hoverColor
                : regions.darkForest.color
            }
            opacity={
              selectedRegion === 'darkForest' || hoveredRegion === 'darkForest' ? 0.9 : 0.7
            }
            stroke={
              selectedRegion === 'darkForest' 
                ? '#00b894' 
                : hoveredRegion === 'darkForest' 
                ? '#00d4aa' 
                : 'transparent'
            }
            strokeWidth={selectedRegion === 'darkForest' ? 0.8 : hoveredRegion === 'darkForest' ? 0.5 : 0}
            className="transition-all duration-300"
            style={{
              filter: selectedRegion === 'darkForest' || hoveredRegion === 'darkForest' 
                ? 'drop-shadow(0 0 8px rgba(0, 184, 148, 0.8))' 
                : 'none',
            }}
          />
          {/* Кордон королівства */}
          {getKingdomForRegion('darkForest') && (
            <path
              d={regions.darkForest.path}
              fill="none"
              stroke={getKingdomForRegion('darkForest').color}
              strokeWidth="0.3"
              strokeDasharray="1,1"
              opacity="0.8"
              className="kingdom-border animate-flag"
            />
          )}
          <text
            x="62.5"
            y="32"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="3.5"
            fontWeight="bold"
            className="pointer-events-none"
            style={{ textShadow: '0 0 4px rgba(0, 0, 0, 0.8)' }}
          >
            {regions.darkForest.name}
          </text>
          {/* Прапор королівства */}
          {getKingdomForRegion('darkForest') && (
            <text
              x="52"
              y="18"
              fontSize="4"
              className="pointer-events-none animate-flag"
            >
              {getKingdomForRegion('darkForest').flagEmoji}
            </text>
          )}
        </g>

        {/* Регіон: Забуті шахти */}
        <g
          className="map-region cursor-pointer transition-all duration-300"
          onClick={() => handleRegionClick('forgottenMines')}
          onMouseEnter={() => handleRegionHover('forgottenMines')}
          onMouseLeave={handleRegionLeave}
        >
          <path
            d={regions.forgottenMines.path}
            fill={
              selectedRegion === 'forgottenMines'
                ? regions.forgottenMines.hoverColor
                : hoveredRegion === 'forgottenMines'
                ? regions.forgottenMines.hoverColor
                : regions.forgottenMines.color
            }
            opacity={
              selectedRegion === 'forgottenMines' || hoveredRegion === 'forgottenMines' ? 0.9 : 0.7
            }
            stroke={
              selectedRegion === 'forgottenMines' 
                ? '#e17055' 
                : hoveredRegion === 'forgottenMines' 
                ? '#ff7675' 
                : 'transparent'
            }
            strokeWidth={selectedRegion === 'forgottenMines' ? 0.8 : hoveredRegion === 'forgottenMines' ? 0.5 : 0}
            className="transition-all duration-300"
            style={{
              filter: selectedRegion === 'forgottenMines' || hoveredRegion === 'forgottenMines' 
                ? 'drop-shadow(0 0 8px rgba(225, 112, 85, 0.8))' 
                : 'none',
            }}
          />
          {/* Кордон королівства */}
          {getKingdomForRegion('forgottenMines') && (
            <path
              d={regions.forgottenMines.path}
              fill="none"
              stroke={getKingdomForRegion('forgottenMines').color}
              strokeWidth="0.3"
              strokeDasharray="1,1"
              opacity="0.8"
              className="kingdom-border animate-flag"
            />
          )}
          <text
            x="32.5"
            y="70"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="3.5"
            fontWeight="bold"
            className="pointer-events-none"
            style={{ textShadow: '0 0 4px rgba(0, 0, 0, 0.8)' }}
          >
            {regions.forgottenMines.name}
          </text>
          {/* Прапор королівства */}
          {getKingdomForRegion('forgottenMines') && (
            <text
              x="22"
              y="58"
              fontSize="4"
              className="pointer-events-none animate-flag"
            >
              {getKingdomForRegion('forgottenMines').flagEmoji}
            </text>
          )}
        </g>

        {/* Декоративні елементи */}
        <g opacity="0.3">
          {/* Гори на задньому плані */}
          <path d="M 0 20 L 15 10 L 30 15 L 50 8 L 70 12 L 85 5 L 100 10 L 100 0 L 0 0 Z" fill="#2d3436" />
          {/* Хмари */}
          <ellipse cx="15" cy="12" rx="4" ry="2" fill="#636e72" />
          <ellipse cx="80" cy="8" rx="5" ry="2.5" fill="#636e72" />
        </g>
      </svg>
    </div>
  );
};
