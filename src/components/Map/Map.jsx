import { useState } from 'react';
import { KINGDOMS } from '../../data/kingdoms';
import { useKingdomContext } from '../../contexts/KingdomContext';

// Типи карт
const MAP_TYPES = {
  POLITICAL: 'political',
  BIOMES: 'biomes',
  RESOURCES: 'resources',
};

// Визначення регіонів карти (21 провінція)
const regions = {
  capital: {
    id: 'capital',
    name: 'Столиця',
    description: 'Величезне місто з замками та баштами.',
    type: 'місто',
    biome: 'city',
    resources: ['gold', 'food', 'trade'],
    path: 'M 20 45 L 30 42 L 35 50 L 28 58 L 18 55 Z',
    position: { x: 25, y: 50 },
  },
  darkForest: {
    id: 'darkForest',
    name: 'Темний ліс',
    description: 'Таємничий ліс, повний небезпек.',
    type: 'ліс',
    biome: 'forest',
    resources: ['wood', 'herbs', 'wildlife'],
    path: 'M 40 45 L 50 43 L 55 50 L 48 57 L 38 54 Z',
    position: { x: 45, y: 50 },
  },
  forgottenMines: {
    id: 'forgottenMines',
    name: 'Забуті шахти',
    description: 'Темні підземні шахти.',
    type: 'підземелля',
    biome: 'underground',
    resources: ['iron', 'coal', 'gems'],
    path: 'M 10 30 L 18 28 L 22 35 L 16 42 L 8 39 Z',
    position: { x: 15, y: 35 },
  },
  mountainPeak: {
    id: 'mountainPeak',
    name: 'Гірська Вершина',
    description: 'Високі гори з холодним повітрям.',
    type: 'гори',
    biome: 'mountain',
    resources: ['stone', 'crystals', 'silver'],
    path: 'M 58 30 L 67 28 L 72 35 L 66 42 L 56 39 Z',
    position: { x: 63, y: 35 },
  },
  seaPort: {
    id: 'seaPort',
    name: 'Морський Порт',
    description: 'Великий порт з кораблями.',
    type: 'порт',
    biome: 'coast',
    resources: ['fish', 'salt', 'pearls'],
    path: 'M 5 60 L 13 58 L 17 65 L 12 72 L 3 69 Z',
    position: { x: 10, y: 65 },
  },
  shadowGate: {
    id: 'shadowGate',
    name: 'Тіньова Брама',
    description: 'Таємниче місце тіней.',
    type: 'тіньове',
    biome: 'shadowlands',
    resources: ['shadow_essence', 'cursed_items'],
    path: 'M 25 65 L 33 63 L 37 70 L 32 77 L 23 74 Z',
    position: { x: 30, y: 70 },
  },
  volcanoIsland: {
    id: 'volcanoIsland',
    name: 'Вулканічний Острів',
    description: 'Острів з активним вулканом.',
    type: 'вулкан',
    biome: 'volcanic',
    resources: ['obsidian', 'sulfur', 'lava_crystals'],
    path: 'M 45 65 L 53 63 L 57 70 L 52 77 L 43 74 Z',
    position: { x: 50, y: 70 },
  },
  frostCastle: {
    id: 'frostCastle',
    name: 'Крижаний Замок',
    description: 'Замок з вічного льоду.',
    type: 'замок',
    biome: 'tundra',
    resources: ['ice_crystals', 'frozen_herbs'],
    path: 'M 65 60 L 73 58 L 77 65 L 72 72 L 63 69 Z',
    position: { x: 70, y: 65 },
  },
  holyTemple: {
    id: 'holyTemple',
    name: 'Святий Храм',
    description: 'Храм світла та справедливості.',
    type: 'храм',
    biome: 'sacred',
    resources: ['holy_water', 'blessed_items'],
    path: 'M 80 45 L 88 43 L 92 50 L 87 57 L 78 54 Z',
    position: { x: 85, y: 50 },
  },
  darkCitadel: {
    id: 'darkCitadel',
    name: 'Темна Цитадель',
    description: 'Цитадель темних магів.',
    type: 'цитадель',
    biome: 'corrupted',
    resources: ['dark_crystals', 'cursed_ore'],
    path: 'M 85 20 L 93 18 L 97 25 L 92 32 L 83 29 Z',
    position: { x: 90, y: 25 },
  },
  dragonNest: {
    id: 'dragonNest',
    name: 'Гніздо Дракона',
    description: 'Легендарне гніздо драконів.',
    type: 'гніздо',
    biome: 'dragon_lair',
    resources: ['dragon_scales', 'fire_gems', 'gold'],
    path: 'M 75 8 L 83 6 L 87 13 L 82 20 L 73 17 Z',
    position: { x: 80, y: 13 },
  },
  elfGrove: {
    id: 'elfGrove',
    name: 'Ельфійська Гаща',
    description: 'Магічний ліс ельфів.',
    type: 'гаща',
    biome: 'enchanted_forest',
    resources: ['magic_herbs', 'moonwood', 'mana_crystals'],
    path: 'M 45 20 L 53 18 L 57 25 L 52 32 L 43 29 Z',
    position: { x: 50, y: 25 },
  },
  dwarfForge: {
    id: 'dwarfForge',
    name: 'Двафійська Кузня',
    description: 'Підземна кузня гномів.',
    type: 'кузня',
    biome: 'underground',
    resources: ['mithril', 'adamantite', 'coal'],
    path: 'M 30 18 L 38 16 L 42 23 L 37 30 L 28 27 Z',
    position: { x: 35, y: 23 },
  },
  orcStronghold: {
    id: 'orcStronghold',
    name: 'Орочий Цитадель',
    description: 'Фортеця орків.',
    type: 'фортеця',
    biome: 'badlands',
    resources: ['iron', 'crude_oil', 'bones'],
    path: 'M 10 10 L 18 8 L 22 15 L 17 22 L 8 19 Z',
    position: { x: 15, y: 15 },
  },
  skyGarden: {
    id: 'skyGarden',
    name: 'Небесний Сад',
    description: 'Небесні острови в хмарах.',
    type: 'небеса',
    biome: 'sky',
    resources: ['sky_crystals', 'cloud_essence', 'feathers'],
    path: 'M 60 10 L 68 8 L 72 15 L 67 22 L 58 19 Z',
    position: { x: 65, y: 15 },
  },
  abyssGate: {
    id: 'abyssGate',
    name: 'Брама Безодні',
    description: 'Вхід до підземного світу.',
    type: 'безодня',
    biome: 'abyss',
    resources: ['demon_essence', 'void_crystals', 'souls'],
    path: 'M 5 85 L 13 83 L 17 90 L 12 97 L 3 94 Z',
    position: { x: 10, y: 90 },
  },
  mechFactory: {
    id: 'mechFactory',
    name: 'Механічна Фабрика',
    description: 'Фабрика дивних механізмів.',
    type: 'фабрика',
    biome: 'industrial',
    resources: ['gears', 'oil', 'scrap_metal'],
    path: 'M 25 85 L 33 83 L 37 90 L 32 97 L 23 94 Z',
    position: { x: 30, y: 90 },
  },
  wildGrove: {
    id: 'wildGrove',
    name: 'Дика Гаща',
    description: 'Дикі землі звірів.',
    type: 'дикі',
    biome: 'wilderness',
    resources: ['fur', 'meat', 'wild_herbs'],
    path: 'M 45 85 L 53 83 L 57 90 L 52 97 L 43 94 Z',
    position: { x: 50, y: 90 },
  },
  crystalTower: {
    id: 'crystalTower',
    name: 'Кристальна Вежа',
    description: 'Вежа з магічних кристалів.',
    type: 'вежа',
    biome: 'crystal',
    resources: ['magic_crystals', 'power_shards', 'arcane_dust'],
    path: 'M 65 85 L 73 83 L 77 90 L 72 97 L 63 94 Z',
    position: { x: 70, y: 90 },
  },
  stormPeak: {
    id: 'stormPeak',
    name: 'Вершина Бурі',
    description: 'Вершина, де лютує буря.',
    type: 'буря',
    biome: 'storm',
    resources: ['lightning_crystals', 'storm_essence', 'rare_metals'],
    path: 'M 85 85 L 93 83 L 97 90 L 92 97 L 83 94 Z',
    position: { x: 90, y: 90 },
  },
  tradeHub: {
    id: 'tradeHub',
    name: 'Торговий Хаб',
    description: 'Нейтральний торговий центр.',
    type: 'торгівля',
    biome: 'city',
    resources: ['gold', 'exotic_goods', 'everything'],
    path: 'M 48 48 L 52 48 L 52 52 L 48 52 Z',
    position: { x: 50, y: 50 },
  },
};

// Кольори біомів
const biomeColors = {
  city: '#fdcb6e',
  forest: '#2ecc71',
  underground: '#34495e',
  mountain: '#95a5a6',
  coast: '#3498db',
  shadowlands: '#2c3e50',
  volcanic: '#e74c3c',
  tundra: '#74b9ff',
  sacred: '#f39c12',
  corrupted: '#8e44ad',
  dragon_lair: '#c0392b',
  enchanted_forest: '#1abc9c',
  badlands: '#7f8c8d',
  sky: '#ecf0f1',
  abyss: '#16171a',
  industrial: '#16a085',
  wilderness: '#27ae60',
  crystal: '#a29bfe',
  storm: '#6c5ce7',
};

// Кольори ресурсів
const resourceColors = {
  gold: '#ffd700',
  iron: '#a8a8a8',
  wood: '#8b4513',
  food: '#90ee90',
  fish: '#4682b4',
  stone: '#808080',
  gems: '#ff1493',
  crystals: '#00ffff',
  mithril: '#c0c0c0',
  adamantite: '#ff4500',
};

export const Map = ({ selectedRegion, onSelectRegion }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [mapType, setMapType] = useState(MAP_TYPES.POLITICAL);
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

  const getRegionColor = (region) => {
    const isSelected = selectedRegion === region.id;
    const isHovered = hoveredRegion === region.id;

    if (mapType === MAP_TYPES.BIOMES) {
      return biomeColors[region.biome] || '#555';
    } else if (mapType === MAP_TYPES.RESOURCES) {
      // Показуємо колір основного ресурсу
      const mainResource = region.resources[0];
      return resourceColors[mainResource] || '#666';
    } else {
      // Політична карта - колір королівства
      const kingdom = getKingdomForRegion(region.id);
      if (kingdom) {
        return isSelected || isHovered ? lightenColor(kingdom.color, 20) : kingdom.color;
      }
      return isSelected || isHovered ? '#555' : '#444';
    }
  };

  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  };

  const renderRegion = (region) => {
    const isSelected = selectedRegion === region.id;
    const isHovered = hoveredRegion === region.id;
    const kingdom = getKingdomForRegion(region.id);
    const regionColor = getRegionColor(region);

    return (
      <g
        key={region.id}
        className="map-region cursor-pointer transition-all duration-300"
        onClick={() => handleRegionClick(region.id)}
        onMouseEnter={() => handleRegionHover(region.id)}
        onMouseLeave={handleRegionLeave}
      >
        {/* Основна територія */}
        <path
          d={region.path}
          fill={regionColor}
          opacity={isSelected || isHovered ? 0.9 : 0.7}
          stroke={isSelected ? '#ffd700' : isHovered ? '#ffffff' : 'transparent'}
          strokeWidth={isSelected ? 1 : isHovered ? 0.5 : 0}
          className="transition-all duration-300"
          style={{
            filter:
              isSelected || isHovered
                ? `drop-shadow(0 0 8px ${regionColor})`
                : 'none',
          }}
        />

        {/* Кордон королівства (тільки для політичної карти) */}
        {mapType === MAP_TYPES.POLITICAL && kingdom && (
          <path
            d={region.path}
            fill="none"
            stroke={kingdom.color}
            strokeWidth="0.5"
            strokeDasharray="2,1"
            opacity="0.9"
            className="kingdom-border"
            style={{
              filter: `drop-shadow(0 0 2px ${kingdom.color})`,
            }}
          />
        )}

        {/* SVG іконка замість емодзі */}
        {mapType === MAP_TYPES.POLITICAL && (
          <g transform={`translate(${region.position.x - 2}, ${region.position.y - 2})`}>
            {/* Іконка замку/маркера */}
            <circle
              cx="2"
              cy="2"
              r="1.5"
              fill={kingdom ? kingdom.color : '#888'}
              stroke="#fff"
              strokeWidth="0.2"
              opacity="0.9"
            />
            {isSelected && (
              <circle
                cx="2"
                cy="2"
                r="2.5"
                fill="none"
                stroke="#ffd700"
                strokeWidth="0.3"
                opacity="0.8"
              >
                <animate
                  attributeName="r"
                  from="2.5"
                  to="3.5"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.8"
                  to="0"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        )}

        {/* Назва провінції при наведенні */}
        {isHovered && (
          <text
            x={region.position.x}
            y={region.position.y + 5}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="2"
            fontWeight="bold"
            style={{ 
              textShadow: '0 0 4px rgba(0, 0, 0, 1)',
              pointerEvents: 'none',
            }}
          >
            {region.name}
          </text>
        )}
      </g>
    );
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

      {/* Перемикач типу карти */}
      <div className="absolute top-4 left-4 z-20 bg-fantasy-dark/90 border-2 border-fantasy-gold rounded-lg p-2">
        <div className="text-fantasy-gold text-xs font-bold mb-2 text-center">Тип карти</div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setMapType(MAP_TYPES.POLITICAL)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              mapType === MAP_TYPES.POLITICAL
                ? 'bg-fantasy-gold text-fantasy-dark'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🏛️ Політична
          </button>
          <button
            onClick={() => setMapType(MAP_TYPES.BIOMES)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              mapType === MAP_TYPES.BIOMES
                ? 'bg-fantasy-gold text-fantasy-dark'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🌍 Біоми
          </button>
          <button
            onClick={() => setMapType(MAP_TYPES.RESOURCES)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              mapType === MAP_TYPES.RESOURCES
                ? 'bg-fantasy-gold text-fantasy-dark'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            💎 Ресурси
          </button>
        </div>
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

        {/* Дороги між регіонами (тільки для політичної карти) */}
        {mapType === MAP_TYPES.POLITICAL && (
          <g stroke="#6c5ce7" strokeWidth="0.2" opacity="0.3" fill="none">
            <path d="M 25 50 L 45 50" />
            <path d="M 50 50 L 85 50" />
            <path d="M 50 30 L 50 70" />
            <path d="M 15 35 L 50 30" />
            <path d="M 65 35 L 90 25" />
            <path d="M 10 65 L 30 70" />
            <path d="M 50 70 L 70 70" />
            <path d="M 35 23 L 50 25" />
            <path d="M 50 15 L 80 13" />
            <path d="M 15 15 L 35 23" />
          </g>
        )}

        {/* Регіони */}
        {Object.values(regions).map(renderRegion)}

        {/* Декоративні елементи */}
        {mapType === MAP_TYPES.POLITICAL && (
          <g opacity="0.2">
            {/* Гори на задньому плані */}
            <path d="M 0 20 L 15 10 L 30 15 L 50 8 L 70 12 L 85 5 L 100 10 L 100 0 L 0 0 Z" fill="#2d3436" />
            {/* Хмари */}
            <ellipse cx="15" cy="12" rx="4" ry="2" fill="#636e72" />
            <ellipse cx="80" cy="8" rx="5" ry="2.5" fill="#636e72" />
            <ellipse cx="50" cy="95" rx="6" ry="3" fill="#636e72" />
          </g>
        )}

        {/* Назва вибраного регіону */}
        {selectedRegion && regions[selectedRegion] && (
          <text
            x="50"
            y="5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="2.5"
            fontWeight="bold"
            style={{ textShadow: '0 0 4px rgba(0, 0, 0, 0.8)' }}
          >
            {regions[selectedRegion].name}
          </text>
        )}
      </svg>

      {/* Легенда */}
      <div className="absolute bottom-2 right-2 bg-fantasy-dark/90 border border-fantasy-gold/50 rounded-lg p-2 text-xs max-w-xs">
        <div className="text-fantasy-gold font-bold mb-1">
          {mapType === MAP_TYPES.POLITICAL && '🏛️ Політична карта'}
          {mapType === MAP_TYPES.BIOMES && '🌍 Карта біомів'}
          {mapType === MAP_TYPES.RESOURCES && '💎 Карта ресурсів'}
        </div>
        
        {mapType === MAP_TYPES.POLITICAL && (
          <div className="text-white space-y-0.5">
            <div>21 держава</div>
            <div className="text-gray-400 text-[10px]">Кліктіне для деталей</div>
          </div>
        )}

        {mapType === MAP_TYPES.BIOMES && hoveredRegion && regions[hoveredRegion] && (
          <div className="text-white">
            <div className="font-semibold">{regions[hoveredRegion].name}</div>
            <div className="text-gray-400 text-[10px]">Біом: {regions[hoveredRegion].biome}</div>
          </div>
        )}

        {mapType === MAP_TYPES.RESOURCES && hoveredRegion && regions[hoveredRegion] && (
          <div className="text-white">
            <div className="font-semibold">{regions[hoveredRegion].name}</div>
            <div className="text-gray-400 text-[10px]">
              Ресурси: {regions[hoveredRegion].resources.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
