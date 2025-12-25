// Централізована база даних предметів

// Система рідкості:
// common - Звичайна (сірий)
// uncommon - Постійна (зелений)
// combat - Бойова (синій)
// epic - Епічна (фіолетовий)
// legendary - Легендарна (золотий)
// mythic - Міфічна (помаранчевий)
// divine - Божественна (білий/райдужний)

// Ресурси та матеріали
export const RESOURCES = {
  // Базові матеріали (common)
  herb: { id: 'herb', name: 'Трава', icon: '🌿', type: 'material', rarity: 'common', basePrice: 5 },
  water: { id: 'water', name: 'Вода', icon: '💧', type: 'material', rarity: 'common', basePrice: 2 },
  wood: { id: 'wood', name: 'Дерево', icon: '🪵', type: 'material', rarity: 'common', basePrice: 3 },
  stone: { id: 'stone', name: 'Камінь', icon: '🪨', type: 'material', rarity: 'common', basePrice: 4 },
  iron_ore: { id: 'iron_ore', name: 'Залізна руда', icon: '⛏️', type: 'material', rarity: 'common', basePrice: 10 },
  coal: { id: 'coal', name: 'Вугілля', icon: '🪨', type: 'material', rarity: 'common', basePrice: 8 },
  leather: { id: 'leather', name: 'Шкіра', icon: '🦌', type: 'material', rarity: 'common', basePrice: 12 },
  fur: { id: 'fur', name: 'Хутро', icon: '🐺', type: 'material', rarity: 'common', basePrice: 15 },
  bone: { id: 'bone', name: 'Кістка', icon: '🦴', type: 'material', rarity: 'common', basePrice: 8 },
  
  // Постійні матеріали (uncommon)
  copper_ore: { id: 'copper_ore', name: 'Мідна руда', icon: '🟠', type: 'material', rarity: 'uncommon', basePrice: 15 },
  bronze_ingot: { id: 'bronze_ingot', name: 'Бронзовий злиток', icon: '🟫', type: 'material', rarity: 'uncommon', basePrice: 20 },
  refined_wood: { id: 'refined_wood', name: 'Оброблене дерево', icon: '🪵', type: 'material', rarity: 'uncommon', basePrice: 12 },
  hardened_leather: { id: 'hardened_leather', name: 'Загартована шкіра', icon: '🦌', type: 'material', rarity: 'uncommon', basePrice: 25 },
  
  // Бойові матеріали (combat)
  silver_ore: { id: 'silver_ore', name: 'Срібна руда', icon: '💎', type: 'material', rarity: 'combat', basePrice: 25 },
  gold_ore: { id: 'gold_ore', name: 'Золота руда', icon: '🥇', type: 'material', rarity: 'combat', basePrice: 50 },
  crystal: { id: 'crystal', name: 'Кристал', icon: '💠', type: 'material', rarity: 'combat', basePrice: 30 },
  mana_crystal: { id: 'mana_crystal', name: 'Кристал мани', icon: '🔮', type: 'material', rarity: 'combat', basePrice: 40 },
  steel_ingot: { id: 'steel_ingot', name: 'Сталевий злиток', icon: '⚙️', type: 'material', rarity: 'combat', basePrice: 35 },
  
  // Епічні матеріали (epic)
  mithril_ore: { id: 'mithril_ore', name: 'Мітрилова руда', icon: '✨', type: 'material', rarity: 'epic', basePrice: 100 },
  dragon_scale: { id: 'dragon_scale', name: 'Драконяча луска', icon: '🐉', type: 'material', rarity: 'epic', basePrice: 200 },
  demon_heart: { id: 'demon_heart', name: 'Серце демона', icon: '👹', type: 'material', rarity: 'epic', basePrice: 300 },
  void_crystal: { id: 'void_crystal', name: 'Кристал порожнечі', icon: '🌑', type: 'material', rarity: 'epic', basePrice: 250 },
  
  // Легендарні матеріали (legendary)
  phoenix_feather: { id: 'phoenix_feather', name: 'Пір\'я фенікса', icon: '🔥', type: 'material', rarity: 'legendary', basePrice: 500 },
  angel_wing: { id: 'angel_wing', name: 'Крило ангела', icon: '👼', type: 'material', rarity: 'legendary', basePrice: 600 },
  titan_blood: { id: 'titan_blood', name: 'Кров титана', icon: '🩸', type: 'material', rarity: 'legendary', basePrice: 800 },
  chaos_essence: { id: 'chaos_essence', name: 'Есенція хаосу', icon: '🌀', type: 'material', rarity: 'legendary', basePrice: 700 },
  
  // Міфічні матеріали (mythic)
  godstone: { id: 'godstone', name: 'Божественний камінь', icon: '💎', type: 'material', rarity: 'mythic', basePrice: 2000 },
  primordial_essence: { id: 'primordial_essence', name: 'Первісна есенція', icon: '🌟', type: 'material', rarity: 'mythic', basePrice: 2500 },
  eternal_flame: { id: 'eternal_flame', name: 'Вічне полум\'я', icon: '🔥', type: 'material', rarity: 'mythic', basePrice: 3000 },
  
  // Божественні матеріали (divine)
  divine_fragment: { id: 'divine_fragment', name: 'Фрагмент божественності', icon: '✨', type: 'material', rarity: 'divine', basePrice: 10000 },
  creation_core: { id: 'creation_core', name: 'Ядро творіння', icon: '🌌', type: 'material', rarity: 'divine', basePrice: 15000 },
};

// Зброя
export const WEAPONS = [
  // Звичайна (common)
  { id: 'starter_sword', name: 'Меч початківця', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 100, stats: { strength: 5 }, icon: '⚔️' },
  { id: 'wooden_staff', name: 'Дерев\'яний посох', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 80, stats: { intelligence: 5 }, icon: '🪄' },
  { id: 'iron_dagger', name: 'Залізний кинджал', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 90, stats: { agility: 5 }, icon: '🗡️' },
  { id: 'rusty_sword', name: 'Іржавий меч', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 70, stats: { strength: 4 }, icon: '⚔️' },
  { id: 'bone_club', name: 'Кісткова булава', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 85, stats: { strength: 6 }, icon: '🦴' },
  
  // Постійна (uncommon)
  { id: 'copper_sword', name: 'Мідний меч', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 200, stats: { strength: 8 }, icon: '⚔️' },
  { id: 'bronze_blade', name: 'Бронзовий клинок', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 250, stats: { strength: 10, agility: 2 }, icon: '🗡️' },
  { id: 'apprentice_staff', name: 'Посох учня', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 220, stats: { intelligence: 10, mana: 10 }, icon: '🪄' },
  { id: 'hunter_bow', name: 'Лук мисливця', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 240, stats: { agility: 10, strength: 3 }, icon: '🏹' },
  { id: 'reinforced_mace', name: 'Підсилена булава', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 230, stats: { strength: 12 }, icon: '🔨' },
  
  // Бойова (combat)
  { id: 'iron_sword', name: 'Залізний меч', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 500, stats: { strength: 15 }, icon: '⚔️' },
  { id: 'steel_sword', name: 'Сталевий меч', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 600, stats: { strength: 18, agility: 3 }, icon: '⚔️' },
  { id: 'warrior_sword', name: 'Меч воїна', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 700, stats: { strength: 20 }, icon: '⚔️' },
  { id: 'magic_staff', name: 'Магічний посох', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 550, stats: { intelligence: 18, mana: 20 }, icon: '🪄' },
  { id: 'silver_rapier', name: 'Срібна рапіра', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 650, stats: { agility: 18, strength: 8 }, icon: '🗡️' },
  { id: 'crystal_wand', name: 'Кристальна паличка', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 580, stats: { intelligence: 20, mana: 30 }, icon: '🪄' },
  { id: 'battle_axe', name: 'Бойова сокира', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 680, stats: { strength: 22, defense: 3 }, icon: '🪓' },
  
  // Епічна (epic)
  { id: 'epic_sword', name: 'Епічний меч', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 1500, stats: { strength: 25, agility: 10 }, icon: '⚔️' },
  { id: 'dragon_blade', name: 'Драконячий клинок', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 2000, stats: { strength: 30, defense: 5 }, icon: '🗡️' },
  { id: 'archmage_staff', name: 'Посох архімага', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 1800, stats: { intelligence: 30, mana: 50 }, icon: '🪄' },
  { id: 'void_reaper', name: 'Жнець порожнечі', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 2200, stats: { strength: 35, intelligence: 15 }, icon: '⚔️' },
  { id: 'demon_slayer', name: 'Вбивця демонів', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 2100, stats: { strength: 32, agility: 12, defense: 8 }, icon: '🗡️' },
  { id: 'storm_caller', name: 'Викликач бурі', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 1900, stats: { intelligence: 35, mana: 60, agility: 10 }, icon: '🪄' },
  
  // Легендарна (legendary)
  { id: 'legendary_sword', name: 'Легендарний меч', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 5000, stats: { strength: 50, agility: 20, defense: 10 }, icon: '⚔️' },
  { id: 'excalibur', name: 'Екскалібур', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 6000, stats: { strength: 60, intelligence: 15, agility: 15 }, icon: '⚔️' },
  { id: 'phoenix_blade', name: 'Клинок фенікса', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 5500, stats: { strength: 55, agility: 25, health: 100 }, icon: '🗡️' },
  { id: 'titan_hammer', name: 'Молот титана', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 5800, stats: { strength: 65, defense: 15 }, icon: '🔨' },
  { id: 'chaos_staff', name: 'Посох хаосу', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 6200, stats: { intelligence: 60, mana: 100, strength: 20 }, icon: '🪄' },
  
  // Міфічна (mythic)
  { id: 'godslayer', name: 'Вбивця богів', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 15000, stats: { strength: 100, agility: 40, intelligence: 30, defense: 20 }, icon: '⚔️' },
  { id: 'eternal_blade', name: 'Вічний клинок', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 18000, stats: { strength: 120, agility: 50, health: 200 }, icon: '🗡️' },
  { id: 'primordial_staff', name: 'Первісний посох', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 16000, stats: { intelligence: 100, mana: 200, strength: 40 }, icon: '🪄' },
  { id: 'worldbreaker', name: 'Руйнівник світів', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 20000, stats: { strength: 150, intelligence: 50, defense: 30 }, icon: '⚔️' },
  
  // Божественна (divine)
  { id: 'divine_sword', name: 'Божественний меч', type: 'weapon', slot: 'weapon', rarity: 'divine', basePrice: 50000, stats: { strength: 200, agility: 80, intelligence: 60, defense: 50, health: 500, mana: 300 }, icon: '⚔️' },
  { id: 'creation_blade', name: 'Клинок творіння', type: 'weapon', slot: 'weapon', rarity: 'divine', basePrice: 60000, stats: { strength: 250, intelligence: 100, agility: 100, defense: 60, health: 1000 }, icon: '🗡️' },
  { id: 'omnipotence_staff', name: 'Посох всемогутності', type: 'weapon', slot: 'weapon', rarity: 'divine', basePrice: 55000, stats: { intelligence: 200, mana: 500, strength: 100, agility: 80, defense: 40 }, icon: '🪄' },
];

// Броня
export const ARMOR = [
  // Звичайна (common)
  { id: 'leather_armor', name: 'Шкіряна броня', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 80, stats: { defense: 3 }, icon: '🛡️' },
  { id: 'cloth_robe', name: 'Тканинна мантія', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 70, stats: { intelligence: 3 }, icon: '👕' },
  { id: 'rags', name: 'Лахміття', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 50, stats: { defense: 2 }, icon: '👕' },
  { id: 'hide_armor', name: 'Шкура', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 75, stats: { defense: 4, agility: 1 }, icon: '🛡️' },
  
  // Постійна (uncommon)
  { id: 'copper_armor', name: 'Мідна броня', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 200, stats: { defense: 8 }, icon: '🛡️' },
  { id: 'bronze_plate', name: 'Бронзова пластина', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 250, stats: { defense: 10, strength: 2 }, icon: '🛡️' },
  { id: 'apprentice_robe', name: 'Мантія учня', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 220, stats: { defense: 6, intelligence: 8, mana: 15 }, icon: '👕' },
  { id: 'reinforced_leather', name: 'Підсилена шкіра', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 240, stats: { defense: 9, agility: 3 }, icon: '🛡️' },
  
  // Бойова (combat)
  { id: 'steel_armor', name: 'Сталева броня', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 400, stats: { defense: 12 }, icon: '🛡️' },
  { id: 'chainmail', name: 'Кольчуга', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 450, stats: { defense: 10, agility: 5 }, icon: '🛡️' },
  { id: 'mage_robe', name: 'Мантія мага', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 420, stats: { defense: 8, intelligence: 12, mana: 30 }, icon: '👕' },
  { id: 'silver_armor', name: 'Срібна броня', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 480, stats: { defense: 14, agility: 4 }, icon: '🛡️' },
  { id: 'battle_plate', name: 'Бойова пластина', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 500, stats: { defense: 15, strength: 5 }, icon: '🛡️' },
  
  // Епічна (epic)
  { id: 'dragon_armor', name: 'Драконяча броня', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1500, stats: { defense: 25, strength: 10 }, icon: '🛡️' },
  { id: 'platinum_armor', name: 'Платинова броня', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1800, stats: { defense: 30, agility: 8 }, icon: '🛡️' },
  { id: 'void_armor', name: 'Броня порожнечі', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 2000, stats: { defense: 28, intelligence: 15, mana: 40 }, icon: '🛡️' },
  { id: 'demon_plate', name: 'Демонічна пластина', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1900, stats: { defense: 32, strength: 15, health: 50 }, icon: '🛡️' },
  { id: 'archmage_robe', name: 'Мантія архімага', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1700, stats: { defense: 20, intelligence: 30, mana: 80 }, icon: '👕' },
  
  // Легендарна (legendary)
  { id: 'legendary_armor', name: 'Легендарна броня', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 5000, stats: { defense: 50, strength: 15, agility: 10 }, icon: '🛡️' },
  { id: 'phoenix_armor', name: 'Броня фенікса', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 5500, stats: { defense: 55, health: 150, strength: 20 }, icon: '🛡️' },
  { id: 'titan_plate', name: 'Пластина титана', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 6000, stats: { defense: 60, strength: 25, health: 200 }, icon: '🛡️' },
  { id: 'chaos_armor', name: 'Броня хаосу', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 5800, stats: { defense: 52, intelligence: 25, mana: 100 }, icon: '🛡️' },
  
  // Міфічна (mythic)
  { id: 'god_armor', name: 'Божественна броня', type: 'armor', slot: 'armor', rarity: 'mythic', basePrice: 20000, stats: { defense: 100, strength: 40, agility: 30, health: 300 }, icon: '🛡️' },
  { id: 'eternal_plate', name: 'Вічна пластина', type: 'armor', slot: 'armor', rarity: 'mythic', basePrice: 22000, stats: { defense: 120, strength: 50, health: 500 }, icon: '🛡️' },
  { id: 'primordial_armor', name: 'Первісна броня', type: 'armor', slot: 'armor', rarity: 'mythic', basePrice: 25000, stats: { defense: 110, intelligence: 50, mana: 200, health: 400 }, icon: '🛡️' },
  
  // Божественна (divine)
  { id: 'divine_armor', name: 'Божественна броня', type: 'armor', slot: 'armor', rarity: 'divine', basePrice: 80000, stats: { defense: 200, strength: 80, agility: 60, intelligence: 60, health: 1000, mana: 500 }, icon: '🛡️' },
  { id: 'creation_armor', name: 'Броня творіння', type: 'armor', slot: 'armor', rarity: 'divine', basePrice: 100000, stats: { defense: 250, strength: 100, intelligence: 100, health: 2000, mana: 1000 }, icon: '🛡️' },
];

// Аксесуари
export const ACCESSORIES = {
  rings: [
    // Звичайна
    { id: 'copper_ring', name: 'Мідне кільце', type: 'accessory', slot: 'ring', rarity: 'common', basePrice: 50, stats: { strength: 2 }, icon: '💍' },
    { id: 'iron_ring', name: 'Залізне кільце', type: 'accessory', slot: 'ring', rarity: 'common', basePrice: 60, stats: { strength: 3 }, icon: '💍' },
    
    // Постійна
    { id: 'bronze_ring', name: 'Бронзове кільце', type: 'accessory', slot: 'ring', rarity: 'uncommon', basePrice: 120, stats: { strength: 4, agility: 2 }, icon: '💍' },
    { id: 'copper_band', name: 'Мідний обруч', type: 'accessory', slot: 'ring', rarity: 'uncommon', basePrice: 130, stats: { strength: 5, intelligence: 2 }, icon: '💍' },
    
    // Бойова
    { id: 'silver_ring', name: 'Срібне кільце', type: 'accessory', slot: 'ring', rarity: 'combat', basePrice: 200, stats: { strength: 5, agility: 3 }, icon: '💍' },
    { id: 'gold_ring', name: 'Золоте кільце', type: 'accessory', slot: 'ring', rarity: 'combat', basePrice: 300, stats: { strength: 8, intelligence: 5 }, icon: '💍' },
    { id: 'steel_ring', name: 'Сталеве кільце', type: 'accessory', slot: 'ring', rarity: 'combat', basePrice: 250, stats: { strength: 7, defense: 2 }, icon: '💍' },
    
    // Епічна
    { id: 'diamond_ring', name: 'Діамантове кільце', type: 'accessory', slot: 'ring', rarity: 'epic', basePrice: 800, stats: { strength: 12, agility: 8, intelligence: 8 }, icon: '💍' },
    { id: 'dragon_ring', name: 'Драконяче кільце', type: 'accessory', slot: 'ring', rarity: 'epic', basePrice: 900, stats: { strength: 15, defense: 5, health: 50 }, icon: '💍' },
    { id: 'void_ring', name: 'Кільце порожнечі', type: 'accessory', slot: 'ring', rarity: 'epic', basePrice: 850, stats: { intelligence: 15, mana: 40, agility: 10 }, icon: '💍' },
    
    // Легендарна
    { id: 'legendary_ring', name: 'Легендарне кільце', type: 'accessory', slot: 'ring', rarity: 'legendary', basePrice: 2000, stats: { strength: 20, agility: 15, intelligence: 15 }, icon: '💍' },
    { id: 'phoenix_ring', name: 'Кільце фенікса', type: 'accessory', slot: 'ring', rarity: 'legendary', basePrice: 2500, stats: { strength: 25, health: 100, agility: 20 }, icon: '💍' },
    { id: 'titan_ring', name: 'Кільце титана', type: 'accessory', slot: 'ring', rarity: 'legendary', basePrice: 2200, stats: { strength: 30, defense: 10, health: 150 }, icon: '💍' },
    
    // Міфічна
    { id: 'mythic_ring', name: 'Міфічне кільце', type: 'accessory', slot: 'ring', rarity: 'mythic', basePrice: 8000, stats: { strength: 50, agility: 40, intelligence: 30, health: 300 }, icon: '💍' },
    { id: 'god_ring', name: 'Кільце бога', type: 'accessory', slot: 'ring', rarity: 'mythic', basePrice: 10000, stats: { strength: 60, intelligence: 50, health: 500, mana: 200 }, icon: '💍' },
    
    // Божественна
    { id: 'divine_ring', name: 'Божественне кільце', type: 'accessory', slot: 'ring', rarity: 'divine', basePrice: 50000, stats: { strength: 100, agility: 80, intelligence: 80, defense: 40, health: 1000, mana: 500 }, icon: '💍' },
  ],
  amulets: [
    // Звичайна
    { id: 'wooden_amulet', name: 'Дерев\'яний амулет', type: 'accessory', slot: 'amulet', rarity: 'common', basePrice: 60, stats: { intelligence: 3 }, icon: '🔮' },
    { id: 'bone_amulet', name: 'Кістковий амулет', type: 'accessory', slot: 'amulet', rarity: 'common', basePrice: 55, stats: { intelligence: 2, mana: 5 }, icon: '🔮' },
    
    // Постійна
    { id: 'copper_amulet', name: 'Мідний амулет', type: 'accessory', slot: 'amulet', rarity: 'uncommon', basePrice: 140, stats: { intelligence: 5, mana: 10 }, icon: '🔮' },
    { id: 'bronze_amulet', name: 'Бронзовий амулет', type: 'accessory', slot: 'amulet', rarity: 'uncommon', basePrice: 150, stats: { intelligence: 6, mana: 15 }, icon: '🔮' },
    
    // Бойова
    { id: 'silver_amulet', name: 'Срібний амулет', type: 'accessory', slot: 'amulet', rarity: 'combat', basePrice: 250, stats: { intelligence: 8, mana: 20 }, icon: '🔮' },
    { id: 'crystal_amulet', name: 'Кристальний амулет', type: 'accessory', slot: 'amulet', rarity: 'combat', basePrice: 300, stats: { intelligence: 10, mana: 30, defense: 3 }, icon: '🔮' },
    
    // Епічна
    { id: 'crystal_amulet_epic', name: 'Кристальний амулет', type: 'accessory', slot: 'amulet', rarity: 'epic', basePrice: 900, stats: { intelligence: 15, mana: 50, defense: 5 }, icon: '🔮' },
    { id: 'dragon_amulet', name: 'Драконячий амулет', type: 'accessory', slot: 'amulet', rarity: 'epic', basePrice: 1000, stats: { intelligence: 18, mana: 60, health: 40 }, icon: '🔮' },
    { id: 'void_amulet', name: 'Амулет порожнечі', type: 'accessory', slot: 'amulet', rarity: 'epic', basePrice: 950, stats: { intelligence: 20, mana: 70, agility: 8 }, icon: '🔮' },
    
    // Легендарна
    { id: 'phoenix_amulet', name: 'Амулет фенікса', type: 'accessory', slot: 'amulet', rarity: 'legendary', basePrice: 2500, stats: { intelligence: 25, mana: 100, health: 50 }, icon: '🔮' },
    { id: 'titan_amulet', name: 'Амулет титана', type: 'accessory', slot: 'amulet', rarity: 'legendary', basePrice: 2800, stats: { intelligence: 30, mana: 120, defense: 10 }, icon: '🔮' },
    { id: 'chaos_amulet', name: 'Амулет хаосу', type: 'accessory', slot: 'amulet', rarity: 'legendary', basePrice: 3000, stats: { intelligence: 35, mana: 150, strength: 15 }, icon: '🔮' },
    
    // Міфічна
    { id: 'mythic_amulet', name: 'Міфічний амулет', type: 'accessory', slot: 'amulet', rarity: 'mythic', basePrice: 12000, stats: { intelligence: 80, mana: 300, health: 400, strength: 30 }, icon: '🔮' },
    { id: 'god_amulet', name: 'Амулет бога', type: 'accessory', slot: 'amulet', rarity: 'mythic', basePrice: 15000, stats: { intelligence: 100, mana: 400, health: 600, defense: 20 }, icon: '🔮' },
    
    // Божественна
    { id: 'divine_amulet', name: 'Божественний амулет', type: 'accessory', slot: 'amulet', rarity: 'divine', basePrice: 60000, stats: { intelligence: 150, mana: 800, health: 1500, strength: 60, defense: 50 }, icon: '🔮' },
  ],
  belts: [
    // Звичайна
    { id: 'leather_belt', name: 'Шкіряний пояс', type: 'accessory', slot: 'belt', rarity: 'common', basePrice: 40, stats: { agility: 2 }, icon: '👔' },
    { id: 'rope_belt', name: 'Мотузковий пояс', type: 'accessory', slot: 'belt', rarity: 'common', basePrice: 35, stats: { agility: 1 }, icon: '👔' },
    
    // Постійна
    { id: 'copper_belt', name: 'Мідний пояс', type: 'accessory', slot: 'belt', rarity: 'uncommon', basePrice: 100, stats: { agility: 3, strength: 2 }, icon: '👔' },
    { id: 'bronze_belt', name: 'Бронзовий пояс', type: 'accessory', slot: 'belt', rarity: 'uncommon', basePrice: 110, stats: { agility: 4, defense: 2 }, icon: '👔' },
    
    // Бойова
    { id: 'iron_belt', name: 'Залізний пояс', type: 'accessory', slot: 'belt', rarity: 'combat', basePrice: 180, stats: { defense: 5, strength: 3 }, icon: '👔' },
    { id: 'steel_belt', name: 'Сталевий пояс', type: 'accessory', slot: 'belt', rarity: 'combat', basePrice: 200, stats: { defense: 6, strength: 4, agility: 2 }, icon: '👔' },
    
    // Епічна
    { id: 'dragon_belt', name: 'Драконячий пояс', type: 'accessory', slot: 'belt', rarity: 'epic', basePrice: 700, stats: { defense: 10, strength: 8, agility: 5 }, icon: '👔' },
    { id: 'void_belt', name: 'Пояс порожнечі', type: 'accessory', slot: 'belt', rarity: 'epic', basePrice: 750, stats: { defense: 12, intelligence: 10, agility: 8 }, icon: '👔' },
    
    // Легендарна
    { id: 'legendary_belt', name: 'Легендарний пояс', type: 'accessory', slot: 'belt', rarity: 'legendary', basePrice: 1800, stats: { defense: 15, strength: 12, agility: 10, health: 80 }, icon: '👔' },
    { id: 'titan_belt', name: 'Пояс титана', type: 'accessory', slot: 'belt', rarity: 'legendary', basePrice: 2000, stats: { defense: 20, strength: 15, health: 100 }, icon: '👔' },
    
    // Міфічна
    { id: 'mythic_belt', name: 'Міфічний пояс', type: 'accessory', slot: 'belt', rarity: 'mythic', basePrice: 8000, stats: { defense: 40, strength: 30, agility: 25, health: 300 }, icon: '👔' },
    
    // Божественна
    { id: 'divine_belt', name: 'Божественний пояс', type: 'accessory', slot: 'belt', rarity: 'divine', basePrice: 40000, stats: { defense: 80, strength: 60, agility: 50, health: 800, mana: 400 }, icon: '👔' },
  ],
  boots: [
    // Звичайна
    { id: 'leather_boots', name: 'Шкіряні чоботи', type: 'armor', slot: 'boots', rarity: 'common', basePrice: 60, stats: { agility: 3 }, icon: '👢' },
    { id: 'cloth_boots', name: 'Тканинні чоботи', type: 'armor', slot: 'boots', rarity: 'common', basePrice: 55, stats: { agility: 2 }, icon: '👢' },
    
    // Постійна
    { id: 'copper_boots', name: 'Мідні чоботи', type: 'armor', slot: 'boots', rarity: 'uncommon', basePrice: 150, stats: { agility: 5, defense: 2 }, icon: '👢' },
    { id: 'bronze_boots', name: 'Бронзові чоботи', type: 'armor', slot: 'boots', rarity: 'uncommon', basePrice: 160, stats: { agility: 6, strength: 2 }, icon: '👢' },
    
    // Бойова
    { id: 'iron_boots', name: 'Залізні чоботи', type: 'armor', slot: 'boots', rarity: 'combat', basePrice: 200, stats: { defense: 5, agility: 5 }, icon: '👢' },
    { id: 'steel_boots', name: 'Сталеві чоботи', type: 'armor', slot: 'boots', rarity: 'combat', basePrice: 220, stats: { defense: 6, agility: 6, strength: 2 }, icon: '👢' },
    
    // Епічна
    { id: 'magic_boots', name: 'Магічні чоботи', type: 'armor', slot: 'boots', rarity: 'epic', basePrice: 600, stats: { agility: 12, intelligence: 8 }, icon: '👢' },
    { id: 'dragon_boots', name: 'Драконячі чоботи', type: 'armor', slot: 'boots', rarity: 'epic', basePrice: 650, stats: { agility: 15, defense: 8, strength: 5 }, icon: '👢' },
    { id: 'void_boots', name: 'Чоботи порожнечі', type: 'armor', slot: 'boots', rarity: 'epic', basePrice: 700, stats: { agility: 18, intelligence: 10, mana: 30 }, icon: '👢' },
    
    // Легендарна
    { id: 'legendary_boots', name: 'Легендарні чоботи', type: 'armor', slot: 'boots', rarity: 'legendary', basePrice: 1800, stats: { agility: 25, defense: 12, strength: 10, health: 60 }, icon: '👢' },
    { id: 'phoenix_boots', name: 'Чоботи фенікса', type: 'armor', slot: 'boots', rarity: 'legendary', basePrice: 2000, stats: { agility: 30, health: 100, intelligence: 12 }, icon: '👢' },
    
    // Міфічна
    { id: 'mythic_boots', name: 'Міфічні чоботи', type: 'armor', slot: 'boots', rarity: 'mythic', basePrice: 9000, stats: { agility: 50, defense: 25, strength: 20, health: 250 }, icon: '👢' },
    
    // Божественна
    { id: 'divine_boots', name: 'Божественні чоботи', type: 'armor', slot: 'boots', rarity: 'divine', basePrice: 45000, stats: { agility: 100, defense: 50, strength: 40, intelligence: 30, health: 600, mana: 300 }, icon: '👢' },
  ],
  helmets: [
    // Звичайна
    { id: 'leather_helmet', name: 'Шкіряний шолом', type: 'armor', slot: 'helmet', rarity: 'common', basePrice: 70, stats: { defense: 4 }, icon: '⛑️' },
    { id: 'cloth_cap', name: 'Тканинна шапка', type: 'armor', slot: 'helmet', rarity: 'common', basePrice: 65, stats: { defense: 3, intelligence: 2 }, icon: '⛑️' },
    
    // Постійна
    { id: 'copper_helmet', name: 'Мідний шолом', type: 'armor', slot: 'helmet', rarity: 'uncommon', basePrice: 170, stats: { defense: 6, strength: 2 }, icon: '⛑️' },
    { id: 'bronze_helmet', name: 'Бронзовий шолом', type: 'armor', slot: 'helmet', rarity: 'uncommon', basePrice: 180, stats: { defense: 7, strength: 3 }, icon: '⛑️' },
    
    // Бойова
    { id: 'iron_helmet', name: 'Залізний шолом', type: 'armor', slot: 'helmet', rarity: 'combat', basePrice: 220, stats: { defense: 8, strength: 3 }, icon: '⛑️' },
    { id: 'steel_helmet', name: 'Сталевий шолом', type: 'armor', slot: 'helmet', rarity: 'combat', basePrice: 250, stats: { defense: 10, strength: 4 }, icon: '⛑️' },
    { id: 'mage_hat', name: 'Капелюх мага', type: 'armor', slot: 'helmet', rarity: 'combat', basePrice: 240, stats: { defense: 6, intelligence: 10, mana: 20 }, icon: '🎩' },
    
    // Епічна
    { id: 'dragon_helmet', name: 'Драконячий шолом', type: 'armor', slot: 'helmet', rarity: 'epic', basePrice: 800, stats: { defense: 15, strength: 10, health: 40 }, icon: '⛑️' },
    { id: 'void_helmet', name: 'Шолом порожнечі', type: 'armor', slot: 'helmet', rarity: 'epic', basePrice: 850, stats: { defense: 12, intelligence: 15, mana: 40 }, icon: '⛑️' },
    { id: 'archmage_hat', name: 'Капелюх архімага', type: 'armor', slot: 'helmet', rarity: 'epic', basePrice: 900, stats: { defense: 10, intelligence: 20, mana: 60 }, icon: '🎩' },
    
    // Легендарна
    { id: 'crown', name: 'Корона', type: 'armor', slot: 'helmet', rarity: 'legendary', basePrice: 3000, stats: { intelligence: 20, strength: 15, defense: 10 }, icon: '👑' },
    { id: 'phoenix_helmet', name: 'Шолом фенікса', type: 'armor', slot: 'helmet', rarity: 'legendary', basePrice: 3200, stats: { defense: 18, strength: 18, health: 120 }, icon: '⛑️' },
    { id: 'titan_helmet', name: 'Шолом титана', type: 'armor', slot: 'helmet', rarity: 'legendary', basePrice: 3500, stats: { defense: 25, strength: 20, health: 150 }, icon: '⛑️' },
    
    // Міфічна
    { id: 'mythic_helmet', name: 'Міфічний шолом', type: 'armor', slot: 'helmet', rarity: 'mythic', basePrice: 10000, stats: { defense: 50, strength: 35, intelligence: 25, health: 400 }, icon: '⛑️' },
    { id: 'god_helmet', name: 'Шолом бога', type: 'armor', slot: 'helmet', rarity: 'mythic', basePrice: 12000, stats: { defense: 60, strength: 40, intelligence: 30, health: 500, mana: 200 }, icon: '⛑️' },
    
    // Божественна
    { id: 'divine_helmet', name: 'Божественний шолом', type: 'armor', slot: 'helmet', rarity: 'divine', basePrice: 50000, stats: { defense: 100, strength: 70, intelligence: 60, health: 1000, mana: 500 }, icon: '⛑️' },
  ],
};

// Зілля та споживані предмети
export const POTIONS = [
  // Звичайна
  { id: 'health_potion_small', name: 'Зілля здоров\'я (мале)', type: 'potion', rarity: 'common', basePrice: 30, effect: { health: 30 }, stackable: true, icon: '🧪' },
  { id: 'health_potion', name: 'Зілля здоров\'я', type: 'potion', rarity: 'common', basePrice: 50, effect: { health: 50 }, stackable: true, icon: '🧪' },
  { id: 'mana_potion_small', name: 'Зілля мани (мале)', type: 'potion', rarity: 'common', basePrice: 25, effect: { mana: 25 }, stackable: true, icon: '✨' },
  { id: 'mana_potion', name: 'Зілля мани', type: 'potion', rarity: 'common', basePrice: 40, effect: { mana: 40 }, stackable: true, icon: '✨' },
  
  // Постійна
  { id: 'health_potion_medium', name: 'Зілля здоров\'я (середнє)', type: 'potion', rarity: 'uncommon', basePrice: 70, effect: { health: 70 }, stackable: true, icon: '🧪' },
  { id: 'mana_potion_medium', name: 'Зілля мани (середнє)', type: 'potion', rarity: 'uncommon', basePrice: 55, effect: { mana: 55 }, stackable: true, icon: '✨' },
  { id: 'stamina_potion', name: 'Зілля витривалості', type: 'potion', rarity: 'uncommon', basePrice: 60, effect: { health: 40, mana: 40 }, stackable: true, icon: '💊' },
  
  // Бойова
  { id: 'health_potion_large', name: 'Зілля здоров\'я (велике)', type: 'potion', rarity: 'combat', basePrice: 100, effect: { health: 100 }, stackable: true, icon: '🧪' },
  { id: 'mana_potion_large', name: 'Зілля мани (велике)', type: 'potion', rarity: 'combat', basePrice: 80, effect: { mana: 80 }, stackable: true, icon: '✨' },
  { id: 'regen_potion', name: 'Зілля регенерації', type: 'potion', rarity: 'combat', basePrice: 150, effect: { health: 50, mana: 50 }, stackable: true, icon: '💊' },
  { id: 'strength_potion', name: 'Зілля сили', type: 'potion', rarity: 'combat', basePrice: 200, effect: { buff: { strength: 10, duration: 300 } }, stackable: true, icon: '💪' },
  
  // Епічна
  { id: 'elixir', name: 'Еліксир', type: 'potion', rarity: 'epic', basePrice: 500, effect: { health: 200, mana: 200 }, stackable: true, icon: '⚗️' },
  { id: 'dragon_blood', name: 'Драконяча кров', type: 'potion', rarity: 'epic', basePrice: 600, effect: { health: 300, strength: 20 }, stackable: true, icon: '🩸' },
  { id: 'void_elixir', name: 'Еліксир порожнечі', type: 'potion', rarity: 'epic', basePrice: 700, effect: { health: 250, mana: 250, intelligence: 15 }, stackable: true, icon: '⚗️' },
  
  // Легендарна
  { id: 'phoenix_elixir', name: 'Еліксир фенікса', type: 'potion', rarity: 'legendary', basePrice: 2000, effect: { health: 500, mana: 500, strength: 30, intelligence: 30 }, stackable: true, icon: '⚗️' },
  { id: 'titan_blood', name: 'Кров титана', type: 'potion', rarity: 'legendary', basePrice: 2500, effect: { health: 1000, strength: 50, defense: 20 }, stackable: true, icon: '🩸' },
  
  // Міфічна
  { id: 'god_elixir', name: 'Еліксир бога', type: 'potion', rarity: 'mythic', basePrice: 10000, effect: { health: 2000, mana: 2000, strength: 100, intelligence: 100, defense: 50 }, stackable: true, icon: '⚗️' },
  
  // Божественна
  { id: 'divine_elixir', name: 'Божественний еліксир', type: 'potion', rarity: 'divine', basePrice: 50000, effect: { health: 5000, mana: 5000, strength: 200, intelligence: 200, defense: 100, agility: 150 }, stackable: true, icon: '⚗️' },
];

// Їжа
export const FOOD = [
  // Звичайна
  { id: 'bread', name: 'Хліб', type: 'consumable', rarity: 'common', basePrice: 5, effect: { health: 10 }, stackable: true, icon: '🍞' },
  { id: 'apple', name: 'Яблуко', type: 'consumable', rarity: 'common', basePrice: 3, effect: { health: 5, mana: 5 }, stackable: true, icon: '🍎' },
  { id: 'meat', name: 'М\'ясо', type: 'consumable', rarity: 'common', basePrice: 10, effect: { health: 20 }, stackable: true, icon: '🍖' },
  
  // Постійна
  { id: 'cooked_meat', name: 'Приготоване м\'ясо', type: 'consumable', rarity: 'uncommon', basePrice: 25, effect: { health: 40 }, stackable: true, icon: '🍖' },
  { id: 'magic_apple', name: 'Магічне яблуко', type: 'consumable', rarity: 'uncommon', basePrice: 30, effect: { health: 30, mana: 30 }, stackable: true, icon: '🍎' },
  
  // Бойова
  { id: 'golden_apple', name: 'Золоте яблуко', type: 'consumable', rarity: 'combat', basePrice: 100, effect: { health: 100, mana: 100 }, stackable: true, icon: '🍎' },
  { id: 'feast', name: 'Бенкет', type: 'consumable', rarity: 'combat', basePrice: 150, effect: { health: 150, mana: 100, strength: 5 }, stackable: true, icon: '🍽️' },
  
  // Епічна
  { id: 'dragon_meat', name: 'Драконяче м\'ясо', type: 'consumable', rarity: 'epic', basePrice: 500, effect: { health: 300, strength: 20 }, stackable: true, icon: '🍖' },
  { id: 'ambrosia', name: 'Амброзія', type: 'consumable', rarity: 'epic', basePrice: 600, effect: { health: 400, mana: 400, intelligence: 25 }, stackable: true, icon: '🍯' },
  
  // Легендарна
  { id: 'phoenix_fruit', name: 'Плід фенікса', type: 'consumable', rarity: 'legendary', basePrice: 2000, effect: { health: 800, mana: 800, strength: 40, intelligence: 40 }, stackable: true, icon: '🍎' },
  
  // Міфічна
  { id: 'god_fruit', name: 'Плід бога', type: 'consumable', rarity: 'mythic', basePrice: 10000, effect: { health: 2000, mana: 2000, strength: 100, intelligence: 100 }, stackable: true, icon: '🍎' },
  
  // Божественна
  { id: 'divine_fruit', name: 'Божественний плід', type: 'consumable', rarity: 'divine', basePrice: 50000, effect: { health: 5000, mana: 5000, strength: 200, intelligence: 200, defense: 100 }, stackable: true, icon: '🍎' },
];

// Скроли
export const SCROLLS = [
  // Звичайна
  { id: 'identify_scroll', name: 'Скрол ідентифікації', type: 'consumable', rarity: 'common', basePrice: 50, effect: { identify: true }, stackable: true, icon: '📜' },
  { id: 'minor_heal_scroll', name: 'Скрол малого лікування', type: 'consumable', rarity: 'common', basePrice: 40, effect: { health: 50 }, stackable: true, icon: '📜' },
  
  // Постійна
  { id: 'heal_scroll', name: 'Скрол лікування', type: 'consumable', rarity: 'uncommon', basePrice: 80, effect: { health: 100 }, stackable: true, icon: '📜' },
  { id: 'mana_scroll', name: 'Скрол мани', type: 'consumable', rarity: 'uncommon', basePrice: 70, effect: { mana: 100 }, stackable: true, icon: '📜' },
  
  // Бойова
  { id: 'teleport_scroll', name: 'Скрол телепортації', type: 'consumable', rarity: 'combat', basePrice: 150, effect: { teleport: true }, stackable: true, icon: '📜' },
  { id: 'blessing_scroll', name: 'Скрол благословення', type: 'consumable', rarity: 'combat', basePrice: 200, effect: { buff: { strength: 15, defense: 10, duration: 600 } }, stackable: true, icon: '📜' },
  
  // Епічна
  { id: 'resurrection_scroll', name: 'Скрол воскресіння', type: 'consumable', rarity: 'epic', basePrice: 1000, effect: { resurrection: true }, stackable: true, icon: '📜' },
  { id: 'mass_heal_scroll', name: 'Скрол масового лікування', type: 'consumable', rarity: 'epic', basePrice: 800, effect: { health: 500, mana: 500 }, stackable: true, icon: '📜' },
  
  // Легендарна
  { id: 'divine_scroll', name: 'Божественний скрол', type: 'consumable', rarity: 'legendary', basePrice: 5000, effect: { health: 2000, mana: 2000, strength: 50, intelligence: 50 }, stackable: true, icon: '📜' },
  
  // Міфічна
  { id: 'mythic_scroll', name: 'Міфічний скрол', type: 'consumable', rarity: 'mythic', basePrice: 20000, effect: { health: 5000, mana: 5000, strength: 100, intelligence: 100, defense: 50 }, stackable: true, icon: '📜' },
  
  // Божественна
  { id: 'creation_scroll', name: 'Скрол творіння', type: 'consumable', rarity: 'divine', basePrice: 100000, effect: { health: 10000, mana: 10000, strength: 200, intelligence: 200, defense: 100, agility: 150 }, stackable: true, icon: '📜' },
];

// Спеціальні предмети
export const SPECIAL_ITEMS = [
  // Бойова
  { id: 'treasure_key', name: 'Ключ від скарбниці', type: 'special', rarity: 'combat', basePrice: 200, icon: '🗝️' },
  { id: 'dungeon_key', name: 'Ключ підземелля', type: 'special', rarity: 'combat', basePrice: 300, icon: '🗝️' },
  
  // Епічна
  { id: 'boss_key', name: 'Ключ боса', type: 'special', rarity: 'epic', basePrice: 500, icon: '🗝️' },
  { id: 'treasure_chest', name: 'Скриня скарбів', type: 'special', rarity: 'epic', basePrice: 0, icon: '📦' },
  { id: 'ancient_relic', name: 'Стародавня реліквія', type: 'special', rarity: 'epic', basePrice: 1000, stats: { intelligence: 20, mana: 50 }, icon: '🏺' },
  
  // Легендарна
  { id: 'artifact', name: 'Артефакт', type: 'special', rarity: 'legendary', basePrice: 5000, stats: { strength: 30, intelligence: 30, defense: 20 }, icon: '🏺' },
  { id: 'phoenix_egg', name: 'Яйце фенікса', type: 'special', rarity: 'legendary', basePrice: 8000, stats: { health: 500, mana: 500 }, icon: '🥚' },
  
  // Міфічна
  { id: 'mythic_artifact', name: 'Міфічний артефакт', type: 'special', rarity: 'mythic', basePrice: 30000, stats: { strength: 100, intelligence: 100, defense: 50, health: 1000, mana: 1000 }, icon: '🏺' },
  { id: 'god_seal', name: 'Печатка бога', type: 'special', rarity: 'mythic', basePrice: 40000, stats: { strength: 120, intelligence: 120, defense: 60, health: 1500 }, icon: '🔱' },
  
  // Божественна
  { id: 'divine_artifact', name: 'Божественний артефакт', type: 'special', rarity: 'divine', basePrice: 200000, stats: { strength: 300, intelligence: 300, defense: 150, agility: 200, health: 5000, mana: 5000 }, icon: '🏺' },
  { id: 'creation_stone', name: 'Камінь творіння', type: 'special', rarity: 'divine', basePrice: 500000, stats: { strength: 500, intelligence: 500, defense: 250, agility: 300, health: 10000, mana: 10000 }, icon: '💎' },
];

// Набори предметів
export const ITEM_SETS = [
  {
    id: 'warrior_set',
    name: 'Набір воїна',
    items: ['iron_sword', 'steel_armor', 'iron_helmet', 'iron_boots'],
    bonuses: {
      2: { strength: 5 },
      3: { strength: 10, defense: 5 },
      4: { strength: 15, defense: 10, health: 50 },
    },
  },
  {
    id: 'mage_set',
    name: 'Набір мага',
    items: ['magic_staff', 'mage_robe', 'crystal_amulet', 'magic_boots'],
    bonuses: {
      2: { intelligence: 8 },
      3: { intelligence: 15, mana: 30 },
      4: { intelligence: 25, mana: 60, health: 30 },
    },
  },
  {
    id: 'dragon_set',
    name: 'Драконячий набір',
    items: ['dragon_blade', 'dragon_armor', 'dragon_belt'],
    bonuses: {
      2: { strength: 15, defense: 10 },
      3: { strength: 25, defense: 20, health: 100 },
    },
  },
  {
    id: 'divine_set',
    name: 'Божественний набір',
    items: ['divine_sword', 'divine_armor', 'divine_ring', 'divine_amulet', 'divine_belt', 'divine_boots', 'divine_helmet'],
    bonuses: {
      2: { strength: 50, intelligence: 50 },
      3: { strength: 100, intelligence: 100, defense: 50 },
      4: { strength: 150, intelligence: 150, defense: 75, health: 500 },
      5: { strength: 200, intelligence: 200, defense: 100, health: 1000, mana: 500 },
      6: { strength: 250, intelligence: 250, defense: 125, health: 1500, mana: 1000 },
      7: { strength: 300, intelligence: 300, defense: 150, health: 2000, mana: 1500, agility: 100 },
    },
  },
];

// Функція для отримання предмета за ID
export const getItemById = (itemId) => {
  const allItems = [
    ...WEAPONS,
    ...ARMOR,
    ...ACCESSORIES.rings,
    ...ACCESSORIES.amulets,
    ...ACCESSORIES.belts,
    ...ACCESSORIES.boots,
    ...ACCESSORIES.helmets,
    ...POTIONS,
    ...FOOD,
    ...SCROLLS,
    ...SPECIAL_ITEMS,
  ];
  return allItems.find(item => item.id === itemId);
};

// Функція для отримання ресурсу за ID
export const getResourceById = (resourceId) => {
  return RESOURCES[resourceId] || Object.values(RESOURCES).find(r => r.id === resourceId);
};
