// Визначення королівств
export const KINGDOMS = {
  northernAlliance: {
    id: 'northernAlliance',
    name: 'Північний Альянс',
    color: '#4a90e2',
    flagEmoji: '🏰',
    description: 'Сильне королівство з потужною армією та розвиненою торгівлею.',
  },
  desertHorde: {
    id: 'desertHorde',
    name: 'Пустельна Орда',
    color: '#d4af37',
    flagEmoji: '🏜️',
    description: 'Кочівники пустелі, майстри швидких атак та рейдерства.',
  },
  forestBrotherhood: {
    id: 'forestBrotherhood',
    name: 'Лісове Братство',
    color: '#2ecc71',
    flagEmoji: '🌲',
    description: 'Таємниче товариство, що живе в гармонії з природою.',
  },
};

// Ранги гравців
export const RANKS = {
  commoner: { name: 'Простолюдин', color: '#9e9e9e', order: 0 },
  recruit: { name: 'Рекрут', color: '#ffffff', order: 1 },
  trader: { name: 'Торгівець', color: '#ffd700', order: 2 },
  knight: { name: 'Лицар', color: '#c0c0c0', order: 3 },
  lord: { name: 'Лорд', color: '#ff6b6b', order: 4 },
  marquis: { name: 'Маркіз', color: '#4ecdc4', order: 5 },
  duke: { name: 'Герцог', color: '#95e1d3', order: 6 },
  king: { name: 'Король', color: '#fdcb6e', order: 7 },
  leader: { name: 'Лідер групи', color: '#6c5ce7', order: 8 },
};

// Початковий стан провінцій
export const initialProvinces = {
  capital: {
    id: 'capital',
    name: 'Столиця',
    ownerKingdom: 'northernAlliance',
    taxRate: 0.1, // 10%
    canCapture: false, // Столицю не можна захопити
  },
  darkForest: {
    id: 'darkForest',
    name: 'Темний ліс',
    ownerKingdom: 'forestBrotherhood',
    taxRate: 0.15, // 15%
    canCapture: true,
    minLevelToCapture: 10,
  },
  forgottenMines: {
    id: 'forgottenMines',
    name: 'Забуті шахти',
    ownerKingdom: 'desertHorde',
    taxRate: 0.2, // 20%
    canCapture: true,
    minLevelToCapture: 15,
  },
};

