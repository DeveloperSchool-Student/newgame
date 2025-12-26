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
  
  // Додаткові матеріали
  // Рослинні матеріали
  moonflower: { id: 'moonflower', name: 'Місячна квітка', icon: '🌸', type: 'material', rarity: 'uncommon', basePrice: 18 },
  nightshade: { id: 'nightshade', name: 'Нічна тінь', icon: '🥀', type: 'material', rarity: 'common', basePrice: 8 },
  sage_leaf: { id: 'sage_leaf', name: 'Лист шавлії', icon: '🍃', type: 'material', rarity: 'common', basePrice: 6 },
  mandrake_root: { id: 'mandrake_root', name: 'Корінь мандрагори', icon: '🌿', type: 'material', rarity: 'combat', basePrice: 35 },
  star_flower: { id: 'star_flower', name: 'Зоряна квітка', icon: '🌟', type: 'material', rarity: 'epic', basePrice: 150 },
  
  // Мінерали
  sapphire: { id: 'sapphire', name: 'Сапфір', icon: '💎', type: 'material', rarity: 'combat', basePrice: 45 },
  ruby: { id: 'ruby', name: 'Рубін', icon: '🔴', type: 'material', rarity: 'combat', basePrice: 50 },
  emerald: { id: 'emerald', name: 'Смарагд', icon: '💚', type: 'material', rarity: 'combat', basePrice: 48 },
  diamond: { id: 'diamond', name: 'Діамант', icon: '💎', type: 'material', rarity: 'epic', basePrice: 120 },
  obsidian: { id: 'obsidian', name: 'Обсидіан', icon: '🖤', type: 'material', rarity: 'uncommon', basePrice: 22 },
  moonstone: { id: 'moonstone', name: 'Місячний камінь', icon: '🌙', type: 'material', rarity: 'combat', basePrice: 40 },
  
  // Магічні компоненти
  arcane_dust: { id: 'arcane_dust', name: 'Таємничий пил', icon: '✨', type: 'material', rarity: 'uncommon', basePrice: 20 },
  soul_shard: { id: 'soul_shard', name: 'Осколок душі', icon: '👻', type: 'material', rarity: 'epic', basePrice: 180 },
  ether_essence: { id: 'ether_essence', name: 'Есенція ефіру', icon: '🌫️', type: 'material', rarity: 'combat', basePrice: 38 },
  shadow_essence: { id: 'shadow_essence', name: 'Есенція тіні', icon: '🌑', type: 'material', rarity: 'epic', basePrice: 160 },
  light_essence: { id: 'light_essence', name: 'Есенція світла', icon: '☀️', type: 'material', rarity: 'epic', basePrice: 170 },
  cosmic_dust: { id: 'cosmic_dust', name: 'Космічний пил', icon: '🌌', type: 'material', rarity: 'mythic', basePrice: 1500 },
  divine_spark: { id: 'divine_spark', name: 'Божественна іскра', icon: '⚡', type: 'material', rarity: 'divine', basePrice: 12000 },
};

// Зброя
export const WEAPONS = [
  // Звичайна (common)
  { id: 'starter_sword', name: 'Меч початківця', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 100, stats: { strength: 5 }, icon: '⚔️' },
  { id: 'wooden_staff', name: 'Дерев\'яний посох', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 80, stats: { intelligence: 5 }, icon: '🪄' },
  { id: 'iron_dagger', name: 'Залізний кинджал', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 90, stats: { agility: 5 }, icon: '🗡️' },
  { id: 'rusty_sword', name: 'Іржавий меч', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 70, stats: { strength: 4 }, icon: '⚔️' },
  { id: 'bone_club', name: 'Кісткова булава', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 85, stats: { strength: 6 }, icon: '🦴' },
  { id: 'wooden_bow', name: 'Дерев\'яний лук', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 75, stats: { agility: 6 }, icon: '🏹' },
  { id: 'iron_mace', name: 'Залізна булава', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 95, stats: { strength: 5, defense: 1 }, icon: '🔨' },
  { id: 'copper_blade', name: 'Мідний клинок', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 88, stats: { strength: 5, agility: 1 }, icon: '🗡️' },
  { id: 'stone_axe', name: 'Кам\'яна сокира', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 70, stats: { strength: 5 }, icon: '🪓' },
  { id: 'bamboo_staff', name: 'Бамбуковий посох', type: 'weapon', slot: 'weapon', rarity: 'common', basePrice: 72, stats: { intelligence: 4, mana: 5 }, icon: '🪄' },
  
  // Постійна (uncommon)
  { id: 'copper_sword', name: 'Мідний меч', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 200, stats: { strength: 8 }, icon: '⚔️' },
  { id: 'bronze_blade', name: 'Бронзовий клинок', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 250, stats: { strength: 10, agility: 2 }, icon: '🗡️' },
  { id: 'apprentice_staff', name: 'Посох учня', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 220, stats: { intelligence: 10, mana: 10 }, icon: '🪄' },
  { id: 'hunter_bow', name: 'Лук мисливця', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 240, stats: { agility: 10, strength: 3 }, icon: '🏹' },
  { id: 'reinforced_mace', name: 'Підсилена булава', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 230, stats: { strength: 12 }, icon: '🔨' },
  { id: 'silver_dagger', name: 'Срібний кинджал', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 235, stats: { agility: 11, strength: 2 }, icon: '🗡️' },
  { id: 'iron_axe', name: 'Залізна сокира', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 245, stats: { strength: 11, defense: 2 }, icon: '🪓' },
  { id: 'war_hammer', name: 'Бойовий молот', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 255, stats: { strength: 13, defense: 1 }, icon: '🔨' },
  { id: 'long_bow', name: 'Довгий лук', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 225, stats: { agility: 12, strength: 2 }, icon: '🏹' },
  { id: 'magic_wand', name: 'Магічна паличка', type: 'weapon', slot: 'weapon', rarity: 'uncommon', basePrice: 215, stats: { intelligence: 11, mana: 12 }, icon: '🪄' },
  
  // Бойова (combat)
  { id: 'iron_sword', name: 'Залізний меч', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 500, stats: { strength: 15 }, icon: '⚔️' },
  { id: 'steel_sword', name: 'Сталевий меч', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 600, stats: { strength: 18, agility: 3 }, icon: '⚔️' },
  { id: 'warrior_sword', name: 'Меч воїна', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 700, stats: { strength: 20 }, icon: '⚔️' },
  { id: 'magic_staff', name: 'Магічний посох', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 550, stats: { intelligence: 18, mana: 20 }, icon: '🪄' },
  { id: 'silver_rapier', name: 'Срібна рапіра', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 650, stats: { agility: 18, strength: 8 }, icon: '🗡️' },
  { id: 'crystal_wand', name: 'Кристальна паличка', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 580, stats: { intelligence: 20, mana: 30 }, icon: '🪄' },
  { id: 'battle_axe', name: 'Бойова сокира', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 680, stats: { strength: 22, defense: 3 }, icon: '🪓' },
  { id: 'gold_sword', name: 'Золотий меч', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 720, stats: { strength: 21, intelligence: 5 }, icon: '⚔️' },
  { id: 'platinum_rapier', name: 'Платинова рапіра', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 690, stats: { agility: 20, strength: 10 }, icon: '🗡️' },
  { id: 'battle_staff', name: 'Бойовий посох мага', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 620, stats: { intelligence: 22, mana: 35, defense: 3 }, icon: '🪄' },
  { id: 'great_sword', name: 'Дворучний меч', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 750, stats: { strength: 25, defense: 2 }, icon: '⚔️' },
  { id: 'warrior_crossbow', name: 'Арбалет воїна', type: 'weapon', slot: 'weapon', rarity: 'combat', basePrice: 670, stats: { agility: 19, strength: 12 }, icon: '🏹' },
  
  // Епічна (epic)
  { id: 'epic_sword', name: 'Епічний меч', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 1500, stats: { strength: 25, agility: 10 }, icon: '⚔️' },
  { id: 'dragon_blade', name: 'Драконячий клинок', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 2000, stats: { strength: 30, defense: 5 }, icon: '🗡️' },
  { id: 'archmage_staff', name: 'Посох архімага', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 1800, stats: { intelligence: 30, mana: 50 }, icon: '🪄' },
  { id: 'void_reaper', name: 'Жнець порожнечі', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 2200, stats: { strength: 35, intelligence: 15 }, icon: '⚔️' },
  { id: 'demon_slayer', name: 'Вбивця демонів', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 2100, stats: { strength: 32, agility: 12, defense: 8 }, icon: '🗡️' },
  { id: 'storm_caller', name: 'Викликач бурі', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 1900, stats: { intelligence: 35, mana: 60, agility: 10 }, icon: '🪄' },
  { id: 'twilight_sword', name: 'Меч сутінків', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 2150, stats: { strength: 33, agility: 15, intelligence: 10 }, icon: '⚔️' },
  { id: 'lightning_staff', name: 'Блискавичний посох', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 1950, stats: { intelligence: 38, mana: 65, agility: 8 }, icon: '🪄' },
  { id: 'ice_blade', name: 'Ледяний клинок', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 2050, stats: { strength: 31, intelligence: 18, mana: 40 }, icon: '🗡️' },
  { id: 'fire_axe', name: 'Вогняний топір', type: 'weapon', slot: 'weapon', rarity: 'epic', basePrice: 2100, stats: { strength: 36, defense: 10 }, icon: '🪓' },
  
  // Легендарна (legendary)
  { id: 'legendary_sword', name: 'Легендарний меч', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 5000, stats: { strength: 50, agility: 20, defense: 10 }, icon: '⚔️' },
  { id: 'excalibur', name: 'Екскалібур', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 6000, stats: { strength: 60, intelligence: 15, agility: 15 }, icon: '⚔️' },
  { id: 'phoenix_blade', name: 'Клинок фенікса', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 5500, stats: { strength: 55, agility: 25, health: 100 }, icon: '🗡️' },
  { id: 'titan_hammer', name: 'Молот титана', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 5800, stats: { strength: 65, defense: 15 }, icon: '🔨' },
  { id: 'chaos_staff', name: 'Посох хаосу', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 6200, stats: { intelligence: 60, mana: 100, strength: 20 }, icon: '🪄' },
  { id: 'soulreaper', name: 'Душогуб', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 5900, stats: { strength: 58, agility: 22, intelligence: 12 }, icon: '⚔️' },
  { id: 'stellar_staff', name: 'Зоряний посох', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 6100, stats: { intelligence: 62, mana: 110, defense: 12 }, icon: '🪄' },
  { id: 'eternity_blade', name: 'Меч вічності', type: 'weapon', slot: 'weapon', rarity: 'legendary', basePrice: 6300, stats: { strength: 63, agility: 28, health: 120 }, icon: '🗡️' },
  
  // Міфічна (mythic)
  { id: 'godslayer', name: 'Вбивця богів', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 15000, stats: { strength: 100, agility: 40, intelligence: 30, defense: 20 }, icon: '⚔️' },
  { id: 'eternal_blade', name: 'Вічний клинок', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 18000, stats: { strength: 120, agility: 50, health: 200 }, icon: '🗡️' },
  { id: 'primordial_staff', name: 'Первісний посох', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 16000, stats: { intelligence: 100, mana: 200, strength: 40 }, icon: '🪄' },
  { id: 'worldbreaker', name: 'Руйнівник світів', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 20000, stats: { strength: 150, intelligence: 50, defense: 30 }, icon: '⚔️' },
  { id: 'reality_blade', name: 'Клинок реальності', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 19000, stats: { strength: 130, agility: 60, intelligence: 40, defense: 25 }, icon: '🗡️' },
  { id: 'universe_staff', name: 'Посох всесвіту', type: 'weapon', slot: 'weapon', rarity: 'mythic', basePrice: 17000, stats: { intelligence: 110, mana: 250, strength: 50, health: 250 }, icon: '🪄' },
  
  // Божественна (divine)
  { id: 'divine_sword', name: 'Божественний меч', type: 'weapon', slot: 'weapon', rarity: 'divine', basePrice: 50000, stats: { strength: 200, agility: 80, intelligence: 60, defense: 50, health: 500, mana: 300 }, icon: '⚔️' },
  { id: 'creation_blade', name: 'Клинок творіння', type: 'weapon', slot: 'weapon', rarity: 'divine', basePrice: 60000, stats: { strength: 250, intelligence: 100, agility: 100, defense: 60, health: 1000 }, icon: '🗡️' },
  { id: 'omnipotence_staff', name: 'Посох всемогутності', type: 'weapon', slot: 'weapon', rarity: 'divine', basePrice: 55000, stats: { intelligence: 200, mana: 500, strength: 100, agility: 80, defense: 40 }, icon: '🪄' },
  { id: 'primordial_sword', name: 'Меч першозданної сили', type: 'weapon', slot: 'weapon', rarity: 'divine', basePrice: 65000, stats: { strength: 280, agility: 90, intelligence: 70, defense: 65, health: 800, mana: 200 }, icon: '⚔️' },
  { id: 'absolute_wisdom_staff', name: 'Посох абсолютної мудрості', type: 'weapon', slot: 'weapon', rarity: 'divine', basePrice: 58000, stats: { intelligence: 220, mana: 600, strength: 80, agility: 90, defense: 55, health: 600 }, icon: '🪄' },
];

// Броня
export const ARMOR = [
  // Звичайна (common)
  { id: 'leather_armor', name: 'Шкіряна броня', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 80, stats: { defense: 3 }, icon: '🛡️' },
  { id: 'cloth_robe', name: 'Тканинна мантія', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 70, stats: { intelligence: 3 }, icon: '👕' },
  { id: 'rags', name: 'Лахміття', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 50, stats: { defense: 2 }, icon: '👕' },
  { id: 'hide_armor', name: 'Шкура', type: 'armor', rarity: 'common', basePrice: 75, stats: { defense: 4, agility: 1 }, icon: '🛡️' },
  { id: 'wool_cloak', name: 'Вовняний плащ', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 65, stats: { defense: 3, mana: 5 }, icon: '🧥' },
  { id: 'padded_vest', name: 'Стьобаний жилет', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 78, stats: { defense: 4 }, icon: '🛡️' },
  { id: 'light_chainmail', name: 'Легка кольчуга', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 82, stats: { defense: 5 }, icon: '🛡️' },
  { id: 'traveler_robe', name: 'Мантія мандрівника', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 68, stats: { intelligence: 4 }, icon: '👕' },
  { id: 'simple_tunic', name: 'Проста туніка', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 60, stats: { defense: 2, agility: 2 }, icon: '👕' },
  { id: 'fur_armor', name: 'Хутряна броня', type: 'armor', slot: 'armor', rarity: 'common', basePrice: 77, stats: { defense: 4, health: 10 }, icon: '🛡️' },
  
  // Постійна (uncommon)
  { id: 'copper_armor', name: 'Мідна броня', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 200, stats: { defense: 8 }, icon: '🛡️' },
  { id: 'bronze_plate', name: 'Бронзова пластина', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 250, stats: { defense: 10, strength: 2 }, icon: '🛡️' },
  { id: 'apprentice_robe', name: 'Мантія учня', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 220, stats: { defense: 6, intelligence: 8, mana: 15 }, icon: '👕' },
  { id: 'reinforced_leather', name: 'Підсилена шкіра', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 240, stats: { defense: 9, agility: 3 }, icon: '🛡️' },
  { id: 'iron_chainmail', name: 'Залізна кольчуга', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 235, stats: { defense: 9, strength: 3 }, icon: '🛡️' },
  { id: 'studded_armor', name: 'Шипована броня', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 245, stats: { defense: 10, agility: 2 }, icon: '🛡️' },
  { id: 'mage_tunic', name: 'Туніка мага', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 215, stats: { defense: 7, intelligence: 9, mana: 18 }, icon: '👕' },
  { id: 'scaled_armor', name: 'Лускована броня', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 255, stats: { defense: 11, strength: 2 }, icon: '🛡️' },
  { id: 'enchanted_cloak', name: 'Зачарований плащ', type: 'armor', slot: 'armor', rarity: 'uncommon', basePrice: 225, stats: { defense: 8, intelligence: 7, mana: 20 }, icon: '🧥' },
  
  // Бойова (combat)
  { id: 'steel_armor', name: 'Сталева броня', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 400, stats: { defense: 12 }, icon: '🛡️' },
  { id: 'chainmail', name: 'Кольчуга', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 450, stats: { defense: 10, agility: 5 }, icon: '🛡️' },
  { id: 'mage_robe', name: 'Мантія мага', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 420, stats: { defense: 8, intelligence: 12, mana: 30 }, icon: '👕' },
  { id: 'silver_armor', name: 'Срібна броня', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 480, stats: { defense: 14, agility: 4 }, icon: '🛡️' },
  { id: 'battle_plate', name: 'Бойова пластина', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 500, stats: { defense: 15, strength: 5 }, icon: '🛡️' },
  { id: 'gold_armor', name: 'Золота броня', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 520, stats: { defense: 13, intelligence: 6 }, icon: '🛡️' },
  { id: 'knight_armor', name: 'Лицарська броня', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 510, stats: { defense: 16, strength: 4 }, icon: '🛡️' },
  { id: 'war_robe', name: 'Бойова мантія', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 440, stats: { defense: 9, intelligence: 14, mana: 35 }, icon: '👕' },
  { id: 'dragon_scale_vest', name: 'Жилет з драконячої луски', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 530, stats: { defense: 14, agility: 6, health: 30 }, icon: '🛡️' },
  { id: 'crystal_armor', name: 'Кристальна броня', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 490, stats: { defense: 12, intelligence: 10, mana: 40 }, icon: '🛡️' },
  { id: 'elite_plate', name: 'Елітна пластина', type: 'armor', slot: 'armor', rarity: 'combat', basePrice: 540, stats: { defense: 17, strength: 6, health: 25 }, icon: '🛡️' },
  
  // Епічна (epic)
  { id: 'dragon_armor', name: 'Драконяча броня', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1500, stats: { defense: 25, strength: 10 }, icon: '🛡️' },
  { id: 'platinum_armor', name: 'Платинова броня', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1800, stats: { defense: 30, agility: 8 }, icon: '🛡️' },
  { id: 'void_armor', name: 'Броня порожнечі', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 2000, stats: { defense: 28, intelligence: 15, mana: 40 }, icon: '🛡️' },
  { id: 'demon_plate', name: 'Демонічна пластина', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1900, stats: { defense: 32, strength: 15, health: 50 }, icon: '🛡️' },
  { id: 'archmage_robe', name: 'Мантія архімага', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1700, stats: { defense: 20, intelligence: 30, mana: 80 }, icon: '👕' },
  { id: 'elemental_armor', name: 'Елементальна броня', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1850, stats: { defense: 27, intelligence: 20, mana: 50 }, icon: '🛡️' },
  { id: 'shadow_plate', name: 'Тінева пластина', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1950, stats: { defense: 29, agility: 15, intelligence: 10 }, icon: '🛡️' },
  { id: 'thunder_armor', name: 'Громова броня', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1750, stats: { defense: 26, strength: 18, agility: 8 }, icon: '🛡️' },
  { id: 'frost_mail', name: 'Крижана кольчуга', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 1800, stats: { defense: 28, intelligence: 22, mana: 60 }, icon: '🛡️' },
  { id: 'infernal_plate', name: 'Пекельна пластина', type: 'armor', slot: 'armor', rarity: 'epic', basePrice: 2050, stats: { defense: 33, strength: 20, health: 60 }, icon: '🛡️' },
  
  // Легендарна (legendary)
  { id: 'legendary_armor', name: 'Легендарна броня', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 5000, stats: { defense: 50, strength: 15, agility: 10 }, icon: '🛡️' },
  { id: 'phoenix_armor', name: 'Броня фенікса', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 5500, stats: { defense: 55, health: 150, strength: 20 }, icon: '🛡️' },
  { id: 'titan_plate', name: 'Пластина титана', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 6000, stats: { defense: 60, strength: 25, health: 200 }, icon: '🛡️' },
  { id: 'chaos_armor', name: 'Броня хаосу', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 5800, stats: { defense: 52, intelligence: 25, mana: 100 }, icon: '🛡️' },
  { id: 'celestial_armor', name: 'Небесна броня', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 5600, stats: { defense: 53, agility: 20, intelligence: 18 }, icon: '🛡️' },
  { id: 'ancient_plate', name: 'Стародавня пластина', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 5900, stats: { defense: 58, strength: 28, health: 180 }, icon: '🛡️' },
  { id: 'stellar_robe', name: 'Зоряна мантія', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 5700, stats: { defense: 48, intelligence: 35, mana: 120 }, icon: '👕' },
  { id: 'dragonheart_armor', name: 'Броня драконячого серця', type: 'armor', slot: 'armor', rarity: 'legendary', basePrice: 6100, stats: { defense: 56, strength: 22, health: 220, mana: 80 }, icon: '🛡️' },
  
  // Міфічна (mythic)
  { id: 'god_armor', name: 'Божественна броня', type: 'armor', slot: 'armor', rarity: 'mythic', basePrice: 20000, stats: { defense: 100, strength: 40, agility: 30, health: 300 }, icon: '🛡️' },
  { id: 'eternal_plate', name: 'Вічна пластина', type: 'armor', slot: 'armor', rarity: 'mythic', basePrice: 22000, stats: { defense: 120, strength: 50, health: 500 }, icon: '🛡️' },
  { id: 'primordial_armor', name: 'Первісна броня', type: 'armor', slot: 'armor', rarity: 'mythic', basePrice: 25000, stats: { defense: 110, intelligence: 50, mana: 200, health: 400 }, icon: '🛡️' },
  { id: 'cosmic_plate', name: 'Космічна пластина', type: 'armor', slot: 'armor', rarity: 'mythic', basePrice: 23000, stats: { defense: 115, strength: 45, agility: 35, health: 350 }, icon: '🛡️' },
  { id: 'infinity_armor', name: 'Броня нескінченності', type: 'armor', slot: 'armor', rarity: 'mythic', basePrice: 24000, stats: { defense: 108, intelligence: 60, mana: 250, health: 380 }, icon: '🛡️' },
  { id: 'absolute_guard', name: 'Абсолютний захист', type: 'armor', slot: 'armor', rarity: 'mythic', basePrice: 26000, stats: { defense: 125, strength: 55, agility: 25, health: 450 }, icon: '🛡️' },
  
  // Божественна (divine)
  { id: 'divine_armor', name: 'Божественна броня', type: 'armor', slot: 'armor', rarity: 'divine', basePrice: 80000, stats: { defense: 200, strength: 80, agility: 60, intelligence: 60, health: 1000, mana: 500 }, icon: '🛡️' },
  { id: 'creation_armor', name: 'Броня творіння', type: 'armor', slot: 'armor', rarity: 'divine', basePrice: 100000, stats: { defense: 250, strength: 100, intelligence: 100, health: 2000, mana: 1000 }, icon: '🛡️' },
  { id: 'transcendent_plate', name: 'Трансцендентна пластина', type: 'armor', slot: 'armor', rarity: 'divine', basePrice: 90000, stats: { defense: 220, strength: 110, agility: 70, intelligence: 50, health: 1500, mana: 600 }, icon: '🛡️' },
  { id: 'omnipotent_armor', name: 'Всемогутня броня', type: 'armor', slot: 'armor', rarity: 'divine', basePrice: 95000, stats: { defense: 230, strength: 95, agility: 75, intelligence: 90, health: 1800, mana: 900 }, icon: '🛡️' },
  { id: 'supreme_robe', name: 'Верховна мантія', type: 'armor', slot: 'armor', rarity: 'divine', basePrice: 85000, stats: { defense: 180, intelligence: 150, mana: 800, strength: 60, agility: 65, health: 1200 }, icon: '👕' },
];

// Аксесуари
export const ACCESSORIES = {
  rings: [
    // Звичайна
    { id: 'copper_ring', name: 'Мідне кільце', type: 'accessory', slot: 'ring', rarity: 'common', basePrice: 50, stats: { strength: 2 }, icon: '💍' },
    { id: 'iron_ring', name: 'Залізне кільце', type: 'accessory', slot: 'ring', rarity: 'common', basePrice: 60, stats: { strength: 3 }, icon: '💍' },
    { id: 'bone_ring', name: 'Кісткове кільце', type: 'accessory', slot: 'ring', rarity: 'common', basePrice: 55, stats: { agility: 2 }, icon: '💍' },
    { id: 'wooden_ring', name: 'Дерев\'яне кільце', type: 'accessory', slot: 'ring', rarity: 'common', basePrice: 52, stats: { intelligence: 2 }, icon: '💍' },
    { id: 'stone_ring', name: 'Кам\'яне кільце', type: 'accessory', slot: 'ring', rarity: 'common', basePrice: 58, stats: { defense: 2 }, icon: '💍' },
    
    // Постійна
    { id: 'bronze_ring', name: 'Бронзове кільце', type: 'accessory', slot: 'ring', rarity: 'uncommon', basePrice: 120, stats: { strength: 4, agility: 2 }, icon: '💍' },
    { id: 'copper_band', name: 'Мідний обруч', type: 'accessory', slot: 'ring', rarity: 'uncommon', basePrice: 130, stats: { strength: 5, intelligence: 2 }, icon: '💍' },
    { id: 'steel_ring', name: 'Сталеве кільце', type: 'accessory', slot: 'ring', rarity: 'uncommon', basePrice: 125, stats: { defense: 3, strength: 3 }, icon: '💍' },
    { id: 'jade_ring', name: 'Нефритове кільце', type: 'accessory', slot: 'ring', rarity: 'uncommon', basePrice: 135, stats: { intelligence: 5, mana: 8 }, icon: '💍' },
    { id: 'amber_ring', name: 'Бурштинове кільце', type: 'accessory', slot: 'ring', rarity: 'uncommon', basePrice: 128, stats: { agility: 4, health: 15 }, icon: '💍' },
    
    // Бойова
    { id: 'silver_ring', name: 'Срібне кільце', type: 'accessory', slot: 'ring', rarity: 'combat', basePrice: 200, stats: { strength: 5, agility: 3 }, icon: '💍' },
    { id: 'gold_ring', name: 'Золоте кільце', type: 'accessory', slot: 'ring', rarity: 'combat', basePrice: 300, stats: { strength: 8, intelligence: 5 }, icon: '💍' },
    { id: 'steel_ring', name: 'Сталеве кільце', type: 'accessory', slot: 'ring', rarity: 'combat', basePrice: 250, stats: { strength: 7, defense: 2 }, icon: '💍' },
    { id: 'platinum_ring', name: 'Платинове кільце', type: 'accessory', slot: 'ring', rarity: 'combat', basePrice: 280, stats: { strength: 8, agility: 4 }, icon: '💍' },
    { id: 'sapphire_ring', name: 'Сапфірове кільце', type: 'accessory', slot: 'ring', rarity: 'combat', basePrice: 270, stats: { intelligence: 9, mana: 25 }, icon: '💍' },
    { id: 'ruby_ring', name: 'Рубінове кільце', type: 'accessory', slot: 'ring', rarity: 'combat', basePrice: 290, stats: { strength: 9, health: 30 }, icon: '💍' },
    
    // Епічна
    { id: 'diamond_ring', name: 'Діамантове кільце', type: 'accessory', slot: 'ring', rarity: 'epic', basePrice: 800, stats: { strength: 12, agility: 8, intelligence: 8 }, icon: '💍' },
    { id: 'dragon_ring', name: 'Драконяче кільце', type: 'accessory', slot: 'ring', rarity: 'epic', basePrice: 900, stats: { strength: 15, defense: 5, health: 50 }, icon: '💍' },
    { id: 'void_ring', name: 'Кільце порожнечі', type: 'accessory', slot: 'ring', rarity: 'epic', basePrice: 850, stats: { intelligence: 15, mana: 40, agility: 10 }, icon: '💍' },
    { id: 'emerald_ring', name: 'Смарагдове кільце', type: 'accessory', slot: 'ring', rarity: 'epic', basePrice: 880, stats: { agility: 13, intelligence: 12, mana: 35 }, icon: '💍' },
    { id: 'obsidian_ring', name: 'Обсидіанове кільце', type: 'accessory', slot: 'ring', rarity: 'epic', basePrice: 870, stats: { strength: 14, defense: 8, health: 55 }, icon: '💍' },
    { id: 'moonstone_ring', name: 'Місячне кільце', type: 'accessory', slot: 'ring', rarity: 'epic', basePrice: 860, stats: { intelligence: 16, mana: 45, health: 40 }, icon: '💍' },
    
    // Легендарна
    { id: 'legendary_ring', name: 'Легендарне кільце', type: 'accessory', slot: 'ring', rarity: 'legendary', basePrice: 2000, stats: { strength: 20, agility: 15, intelligence: 15 }, icon: '💍' },
    { id: 'phoenix_ring', name: 'Кільце фенікса', type: 'accessory', slot: 'ring', rarity: 'legendary', basePrice: 2500, stats: { strength: 25, health: 100, agility: 20 }, icon: '💍' },
    { id: 'titan_ring', name: 'Кільце титана', type: 'accessory', slot: 'ring', rarity: 'legendary', basePrice: 2200, stats: { strength: 30, defense: 10, health: 150 }, icon: '💍' },
    { id: 'celestial_ring', name: 'Небесне кільце', type: 'accessory', slot: 'ring', rarity: 'legendary', basePrice: 2400, stats: { intelligence: 28, mana: 120, agility: 18 }, icon: '💍' },
    { id: 'infernal_ring', name: 'Пекельне кільце', type: 'accessory', slot: 'ring', rarity: 'legendary', basePrice: 2300, stats: { strength: 28, agility: 20, health: 130 }, icon: '💍' },
    
    // Міфічна
    { id: 'mythic_ring', name: 'Міфічне кільце', type: 'accessory', slot: 'ring', rarity: 'mythic', basePrice: 8000, stats: { strength: 50, agility: 40, intelligence: 30, health: 300 }, icon: '💍' },
    { id: 'god_ring', name: 'Кільце бога', type: 'accessory', slot: 'ring', rarity: 'mythic', basePrice: 10000, stats: { strength: 60, intelligence: 50, health: 500, mana: 200 }, icon: '💍' },
    { id: 'eternal_ring', name: 'Вічне кільце', type: 'accessory', slot: 'ring', rarity: 'mythic', basePrice: 9500, stats: { strength: 55, agility: 45, intelligence: 40, defense: 30, health: 450 }, icon: '💍' },
    { id: 'primordial_ring', name: 'Первісне кільце', type: 'accessory', slot: 'ring', rarity: 'mythic', basePrice: 9000, stats: { intelligence: 65, mana: 250, health: 400, agility: 35 }, icon: '💍' },
    
    // Божественна
    { id: 'divine_ring', name: 'Божественне кільце', type: 'accessory', slot: 'ring', rarity: 'divine', basePrice: 50000, stats: { strength: 100, agility: 80, intelligence: 80, defense: 40, health: 1000, mana: 500 }, icon: '💍' },
    { id: 'transcendent_ring', name: 'Трансцендентне кільце', type: 'accessory', slot: 'ring', rarity: 'divine', basePrice: 52000, stats: { strength: 110, agility: 85, intelligence: 85, defense: 45, health: 1100, mana: 550 }, icon: '💍' },
    { id: 'omnipotent_ring', name: 'Всемогутнє кільце', type: 'accessory', slot: 'ring', rarity: 'divine', basePrice: 55000, stats: { strength: 105, agility: 90, intelligence: 90, defense: 50, health: 1200, mana: 600 }, icon: '💍' },
  ],
  amulets: [
    // Звичайна
    { id: 'wooden_amulet', name: 'Дерев\'яний амулет', type: 'accessory', slot: 'amulet', rarity: 'common', basePrice: 60, stats: { intelligence: 3 }, icon: '🔮' },
    { id: 'bone_amulet', name: 'Кістковий амулет', type: 'accessory', slot: 'amulet', rarity: 'common', basePrice: 55, stats: { intelligence: 2, mana: 5 }, icon: '🔮' },
    { id: 'clay_amulet', name: 'Глиняний амулет', type: 'accessory', slot: 'amulet', rarity: 'common', basePrice: 50, stats: { intelligence: 2 }, icon: '🔮' },
    { id: 'simple_pendant', name: 'Простий кулон', type: 'accessory', slot: 'amulet', rarity: 'common', basePrice: 53, stats: { mana: 8 }, icon: '🔮' },
    { id: 'stone_amulet', name: 'Кам\'яний амулет', type: 'accessory', slot: 'amulet', rarity: 'common', basePrice: 57, stats: { intelligence: 3, defense: 1 }, icon: '🔮' },
    
    // Постійна
    { id: 'copper_amulet', name: 'Мідний амулет', type: 'accessory', slot: 'amulet', rarity: 'uncommon', basePrice: 140, stats: { intelligence: 5, mana: 10 }, icon: '🔮' },
    { id: 'bronze_amulet', name: 'Бронзовий амулет', type: 'accessory', slot: 'amulet', rarity: 'uncommon', basePrice: 150, stats: { intelligence: 6, mana: 15 }, icon: '🔮' },
    { id: 'iron_amulet', name: 'Залізний амулет', type: 'accessory', slot: 'amulet', rarity: 'uncommon', basePrice: 145, stats: { intelligence: 5, defense: 3, mana: 12 }, icon: '🔮' },
    { id: 'jade_pendant', name: 'Нефритовий кулон', type: 'accessory', slot: 'amulet', rarity: 'uncommon', basePrice: 155, stats: { intelligence: 7, mana: 18, health: 15 }, icon: '🔮' },
    { id: 'amber_amulet', name: 'Бурштиновий амулет', type: 'accessory', slot: 'amulet', rarity: 'uncommon', basePrice: 148, stats: { intelligence: 6, mana: 16, agility: 2 }, icon: '🔮' },
    
    // Бойова
    { id: 'silver_amulet', name: 'Срібний амулет', type: 'accessory', slot: 'amulet', rarity: 'combat', basePrice: 250, stats: { intelligence: 8, mana: 20 }, icon: '🔮' },
    { id: 'crystal_amulet', name: 'Кристальний амулет', type: 'accessory', slot: 'amulet', rarity: 'combat', basePrice: 300, stats: { intelligence: 10, mana: 30, defense: 3 }, icon: '🔮' },
    { id: 'sapphire_amulet', name: 'Сапфіровий амулет', type: 'accessory', slot: 'amulet', rarity: 'combat', basePrice: 310, stats: { intelligence: 11, mana: 32 }, icon: '🔮' },
    { id: 'ruby_pendant', name: 'Рубіновий кулон', type: 'accessory', slot: 'amulet', rarity: 'combat', basePrice: 290, stats: { intelligence: 9, mana: 28, health: 35 }, icon: '🔮' },
    { id: 'mage_medallion', name: 'Медальйон мага', type: 'accessory', slot: 'amulet', rarity: 'combat', basePrice: 320, stats: { intelligence: 12, mana: 35, defense: 4 }, icon: '🔮' },
    
    // Епічна
    { id: 'crystal_amulet_epic', name: 'Кристальний амулет', type: 'accessory', slot: 'amulet', rarity: 'epic', basePrice: 900, stats: { intelligence: 15, mana: 50, defense: 5 }, icon: '🔮' },
    { id: 'dragon_amulet', name: 'Драконячий амулет', type: 'accessory', slot: 'amulet', rarity: 'epic', basePrice: 1000, stats: { intelligence: 18, mana: 60, health: 40 }, icon: '🔮' },
    { id: 'void_amulet', name: 'Амулет порожнечі', type: 'accessory', slot: 'amulet', rarity: 'epic', basePrice: 950, stats: { intelligence: 20, mana: 70, agility: 8 }, icon: '🔮' },
    { id: 'emerald_amulet', name: 'Смарагдовий амулет', type: 'accessory', slot: 'amulet', rarity: 'epic', basePrice: 980, stats: { intelligence: 19, mana: 65, health: 50 }, icon: '🔮' },
    { id: 'arcane_pendant', name: 'Таємничий кулон', type: 'accessory', slot: 'amulet', rarity: 'epic', basePrice: 970, stats: { intelligence: 21, mana: 75, defense: 6 }, icon: '🔮' },
    { id: 'shadow_amulet', name: 'Тіньовий амулет', type: 'accessory', slot: 'amulet', rarity: 'epic', basePrice: 960, stats: { intelligence: 18, mana: 68, agility: 12 }, icon: '🔮' },
    
    // Легендарна
    { id: 'phoenix_amulet', name: 'Амулет фенікса', type: 'accessory', slot: 'amulet', rarity: 'legendary', basePrice: 2500, stats: { intelligence: 25, mana: 100, health: 50 }, icon: '🔮' },
    { id: 'titan_amulet', name: 'Амулет титана', type: 'accessory', slot: 'amulet', rarity: 'legendary', basePrice: 2800, stats: { intelligence: 30, mana: 120, defense: 10 }, icon: '🔮' },
    { id: 'chaos_amulet', name: 'Амулет хаосу', type: 'accessory', slot: 'amulet', rarity: 'legendary', basePrice: 3000, stats: { intelligence: 35, mana: 150, strength: 15 }, icon: '🔮' },
    { id: 'celestial_amulet', name: 'Небесний амулет', type: 'accessory', slot: 'amulet', rarity: 'legendary', basePrice: 2900, stats: { intelligence: 33, mana: 140, agility: 20, health: 80 }, icon: '🔮' },
    { id: 'ancient_pendant', name: 'Стародавній кулон', type: 'accessory', slot: 'amulet', rarity: 'legendary', basePrice: 3100, stats: { intelligence: 37, mana: 160, defense: 12 }, icon: '🔮' },
    
    // Міфічна
    { id: 'mythic_amulet', name: 'Міфічний амулет', type: 'accessory', slot: 'amulet', rarity: 'mythic', basePrice: 12000, stats: { intelligence: 80, mana: 300, health: 400, strength: 30 }, icon: '🔮' },
    { id: 'god_amulet', name: 'Амулет бога', type: 'accessory', slot: 'amulet', rarity: 'mythic', basePrice: 15000, stats: { intelligence: 100, mana: 400, health: 600, defense: 20 }, icon: '🔮' },
    { id: 'eternal_amulet', name: 'Вічний амулет', type: 'accessory', slot: 'amulet', rarity: 'mythic', basePrice: 14000, stats: { intelligence: 95, mana: 380, health: 550, agility: 40 }, icon: '🔮' },
    { id: 'cosmic_pendant', name: 'Космічний кулон', type: 'accessory', slot: 'amulet', rarity: 'mythic', basePrice: 14500, stats: { intelligence: 105, mana: 420, health: 580, defense: 25 }, icon: '🔮' },
    
    // Божественна
    { id: 'divine_amulet', name: 'Божественний амулет', type: 'accessory', slot: 'amulet', rarity: 'divine', basePrice: 60000, stats: { intelligence: 150, mana: 800, health: 1500, strength: 60, defense: 50 }, icon: '🔮' },
    { id: 'transcendent_amulet', name: 'Трансцендентний амулет', type: 'accessory', slot: 'amulet', rarity: 'divine', basePrice: 62000, stats: { intelligence: 160, mana: 850, health: 1600, strength: 65, defense: 55 }, icon: '🔮' },
    { id: 'supreme_pendant', name: 'Верховний кулон', type: 'accessory', slot: 'amulet', rarity: 'divine', basePrice: 58000, stats: { intelligence: 155, mana: 820, health: 1550, agility: 70, defense: 52 }, icon: '🔮' },
  ],
  belts: [
    // Звичайна
    { id: 'leather_belt', name: 'Шкіряний пояс', type: 'accessory', slot: 'belt', rarity: 'common', basePrice: 40, stats: { agility: 2 }, icon: '👔' },
    { id: 'rope_belt', name: 'Мотузковий пояс', type: 'accessory', slot: 'belt', rarity: 'common', basePrice: 35, stats: { agility: 1 }, icon: '👔' },
    { id: 'cloth_belt', name: 'Тканинний пояс', type: 'accessory', slot: 'belt', rarity: 'common', basePrice: 38, stats: { defense: 1 }, icon: '👔' },
    { id: 'simple_belt', name: 'Простий пояс', type: 'accessory', slot: 'belt', rarity: 'common', basePrice: 42, stats: { strength: 1, agility: 1 }, icon: '👔' },
    { id: 'wool_sash', name: 'Вовняний пояс', type: 'accessory', slot: 'belt', rarity: 'common', basePrice: 36, stats: { mana: 5 }, icon: '👔' },
    
    // Постійна
    { id: 'copper_belt', name: 'Мідний пояс', type: 'accessory', slot: 'belt', rarity: 'uncommon', basePrice: 100, stats: { agility: 3, strength: 2 }, icon: '👔' },
    { id: 'bronze_belt', name: 'Бронзовий пояс', type: 'accessory', slot: 'belt', rarity: 'uncommon', basePrice: 110, stats: { agility: 4, defense: 2 }, icon: '👔' },
    { id: 'studded_belt', name: 'Шипований пояс', type: 'accessory', slot: 'belt', rarity: 'uncommon', basePrice: 115, stats: { strength: 3, defense: 3 }, icon: '👔' },
    { id: 'reinforced_sash', name: 'Підсилений пояс', type: 'accessory', slot: 'belt', rarity: 'uncommon', basePrice: 105, stats: { agility: 5, strength: 2 }, icon: '👔' },
    { id: 'mage_belt', name: 'Пояс мага', type: 'accessory', slot: 'belt', rarity: 'uncommon', basePrice: 108, stats: { intelligence: 4, mana: 12 }, icon: '👔' },
    
    // Бойова
    { id: 'iron_belt', name: 'Залізний пояс', type: 'accessory', slot: 'belt', rarity: 'combat', basePrice: 180, stats: { defense: 5, strength: 3 }, icon: '👔' },
    { id: 'steel_belt', name: 'Сталевий пояс', type: 'accessory', slot: 'belt', rarity: 'combat', basePrice: 200, stats: { defense: 6, strength: 4, agility: 2 }, icon: '👔' },
    { id: 'gold_belt', name: 'Золотий пояс', type: 'accessory', slot: 'belt', rarity: 'combat', basePrice: 210, stats: { defense: 5, strength: 5, intelligence: 3 }, icon: '👔' },
    { id: 'warrior_belt', name: 'Пояс воїна', type: 'accessory', slot: 'belt', rarity: 'combat', basePrice: 220, stats: { defense: 7, strength: 6, health: 25 }, icon: '👔' },
    { id: 'crystal_belt', name: 'Кристальний пояс', type: 'accessory', slot: 'belt', rarity: 'combat', basePrice: 195, stats: { defense: 5, intelligence: 8, mana: 25 }, icon: '👔' },
    
    // Епічна
    { id: 'dragon_belt', name: 'Драконячий пояс', type: 'accessory', slot: 'belt', rarity: 'epic', basePrice: 700, stats: { defense: 10, strength: 8, agility: 5 }, icon: '👔' },
    { id: 'void_belt', name: 'Пояс порожнечі', type: 'accessory', slot: 'belt', rarity: 'epic', basePrice: 750, stats: { defense: 12, intelligence: 10, agility: 8 }, icon: '👔' },
    { id: 'demon_belt', name: 'Демонічний пояс', type: 'accessory', slot: 'belt', rarity: 'epic', basePrice: 780, stats: { defense: 13, strength: 12, health: 60 }, icon: '👔' },
    { id: 'elemental_sash', name: 'Елементальний пояс', type: 'accessory', slot: 'belt', rarity: 'epic', basePrice: 770, stats: { defense: 11, intelligence: 12, mana: 45 }, icon: '👔' },
    { id: 'shadow_belt', name: 'Тіньовий пояс', type: 'accessory', slot: 'belt', rarity: 'epic', basePrice: 760, stats: { defense: 10, agility: 14, intelligence: 8 }, icon: '👔' },
    
    // Легендарна
    { id: 'legendary_belt', name: 'Легендарний пояс', type: 'accessory', slot: 'belt', rarity: 'legendary', basePrice: 1800, stats: { defense: 15, strength: 12, agility: 10, health: 80 }, icon: '👔' },
    { id: 'titan_belt', name: 'Пояс титана', type: 'accessory', slot: 'belt', rarity: 'legendary', basePrice: 2000, stats: { defense: 20, strength: 15, health: 100 }, icon: '👔' },
    { id: 'celestial_belt', name: 'Небесний пояс', type: 'accessory', slot: 'belt', rarity: 'legendary', basePrice: 2100, stats: { defense: 18, agility: 18, intelligence: 12, health: 90 }, icon: '👔' },
    { id: 'infernal_sash', name: 'Пекельний пояс', type: 'accessory', slot: 'belt', rarity: 'legendary', basePrice: 1950, stats: { defense: 19, strength: 18, health: 110 }, icon: '👔' },
    
    // Міфічна
    { id: 'mythic_belt', name: 'Міфічний пояс', type: 'accessory', slot: 'belt', rarity: 'mythic', basePrice: 8000, stats: { defense: 40, strength: 30, agility: 25, health: 300 }, icon: '👔' },
    { id: 'eternal_belt', name: 'Вічний пояс', type: 'accessory', slot: 'belt', rarity: 'mythic', basePrice: 8500, stats: { defense: 42, strength: 32, agility: 28, health: 320 }, icon: '👔' },
    { id: 'cosmic_sash', name: 'Космічний пояс', type: 'accessory', slot: 'belt', rarity: 'mythic', basePrice: 7800, stats: { defense: 38, intelligence: 35, mana: 150, health: 280 }, icon: '👔' },
    
    // Божественна
    { id: 'divine_belt', name: 'Божественний пояс', type: 'accessory', slot: 'belt', rarity: 'divine', basePrice: 40000, stats: { defense: 80, strength: 60, agility: 50, health: 800, mana: 400 }, icon: '👔' },
    { id: 'transcendent_belt', name: 'Трансцендентний пояс', type: 'accessory', slot: 'belt', rarity: 'divine', basePrice: 42000, stats: { defense: 85, strength: 65, agility: 55, health: 850, mana: 420 }, icon: '👔' },
    { id: 'supreme_sash', name: 'Верховний пояс', type: 'accessory', slot: 'belt', rarity: 'divine', basePrice: 41000, stats: { defense: 82, intelligence: 70, agility: 52, health: 820, mana: 450 }, icon: '👔' },
  ],
  boots: [
    // Звичайна
    { id: 'leather_boots', name: 'Шкіряні чоботи', type: 'armor', slot: 'boots', rarity: 'common', basePrice: 60, stats: { agility: 3 }, icon: '👢' },
    { id: 'cloth_boots', name: 'Тканинні чоботи', type: 'armor', slot: 'boots', rarity: 'common', basePrice: 55, stats: { agility: 2 }, icon: '👢' },
    { id: 'simple_shoes', name: 'Прості черевики', type: 'armor', slot: 'boots', rarity: 'common', basePrice: 52, stats: { agility: 2 }, icon: '👞' },
    { id: 'fur_boots', name: 'Хутряні чоботи', type: 'armor', slot: 'boots', rarity: 'common', basePrice: 58, stats: { agility: 3, health: 5 }, icon: '👢' },
    { id: 'wooden_sandals', name: 'Дерев\'яні сандалі', type: 'armor', slot: 'boots', rarity: 'common', basePrice: 50, stats: { agility: 2, mana: 3 }, icon: '👞' },
    
    // Постійна
    { id: 'copper_boots', name: 'Мідні чоботи', type: 'armor', slot: 'boots', rarity: 'uncommon', basePrice: 150, stats: { agility: 5, defense: 2 }, icon: '👢' },
    { id: 'bronze_boots', name: 'Бронзові чоботи', type: 'armor', slot: 'boots', rarity: 'uncommon', basePrice: 160, stats: { agility: 6, strength: 2 }, icon: '👢' },
    { id: 'reinforced_boots', name: 'Підсилені чоботи', type: 'armor', slot: 'boots', rarity: 'uncommon', basePrice: 165, stats: { agility: 7, defense: 3 }, icon: '👢' },
    { id: 'hunter_boots', name: 'Чоботи мисливця', type: 'armor', slot: 'boots', rarity: 'uncommon', basePrice: 155, stats: { agility: 7, strength: 1 }, icon: '👢' },
    { id: 'mage_boots', name: 'Чоботи мага', type: 'armor', slot: 'boots', rarity: 'uncommon', basePrice: 158, stats: { agility: 5, intelligence: 5, mana: 15 }, icon: '👞' },
    
    // Бойова
    { id: 'iron_boots', name: 'Залізні чоботи', type: 'armor', slot: 'boots', rarity: 'combat', basePrice: 200, stats: { defense: 5, agility: 5 }, icon: '👢' },
    { id: 'steel_boots', name: 'Сталеві чоботи', type: 'armor', slot: 'boots', rarity: 'combat', basePrice: 220, stats: { defense: 6, agility: 6, strength: 2 }, icon: '👢' },
    { id: 'knight_boots', name: 'Лицарські чоботи', type: 'armor', slot: 'boots', rarity: 'combat', basePrice: 230, stats: { defense: 7, agility: 7, strength: 3 }, icon: '👢' },
    { id: 'shadow_walkers', name: 'Тіньові ходаки', type: 'armor', slot: 'boots', rarity: 'combat', basePrice: 210, stats: { agility: 10, intelligence: 5 }, icon: '👞' },
    { id: 'battle_greaves', name: 'Бойові поножі', type: 'armor', slot: 'boots', rarity: 'combat', basePrice: 225, stats: { defense: 8, agility: 6, health: 20 }, icon: '👢' },
    
    // Епічна
    { id: 'magic_boots', name: 'Магічні чоботи', type: 'armor', slot: 'boots', rarity: 'epic', basePrice: 600, stats: { agility: 12, intelligence: 8 }, icon: '👢' },
    { id: 'dragon_boots', name: 'Драконячі чоботи', type: 'armor', slot: 'boots', rarity: 'epic', basePrice: 650, stats: { agility: 15, defense: 8, strength: 5 }, icon: '👢' },
    { id: 'void_boots', name: 'Чоботи порожнечі', type: 'armor', slot: 'boots', rarity: 'epic', basePrice: 700, stats: { agility: 18, intelligence: 10, mana: 30 }, icon: '👢' },
    { id: 'demon_boots', name: 'Демонічні чоботи', type: 'armor', slot: 'boots', rarity: 'epic', basePrice: 720, stats: { agility: 17, strength: 12, health: 50 }, icon: '👢' },
    { id: 'wind_striders', name: 'Вітрові ходаки', type: 'armor', slot: 'boots', rarity: 'epic', basePrice: 680, stats: { agility: 20, intelligence: 8, mana: 25 }, icon: '👞' },
    { id: 'thunder_boots', name: 'Громові чоботи', type: 'armor', slot: 'boots', rarity: 'epic', basePrice: 710, stats: { agility: 16, defense: 10, strength: 8 }, icon: '👢' },
    
    // Легендарна
    { id: 'legendary_boots', name: 'Легендарні чоботи', type: 'armor', slot: 'boots', rarity: 'legendary', basePrice: 1800, stats: { agility: 25, defense: 12, strength: 10, health: 60 }, icon: '👢' },
    { id: 'phoenix_boots', name: 'Чоботи фенікса', type: 'armor', slot: 'boots', rarity: 'legendary', basePrice: 2000, stats: { agility: 30, health: 100, intelligence: 12 }, icon: '👢' },
    { id: 'celestial_boots', name: 'Небесні чоботи', type: 'armor', slot: 'boots', rarity: 'legendary', basePrice: 2100, stats: { agility: 32, intelligence: 15, mana: 80 }, icon: '👞' },
    { id: 'titan_greaves', name: 'Поножі титана', type: 'armor', slot: 'boots', rarity: 'legendary', basePrice: 2050, stats: { agility: 28, defense: 15, strength: 18, health: 90 }, icon: '👢' },
    
    // Міфічна
    { id: 'mythic_boots', name: 'Міфічні чоботи', type: 'armor', slot: 'boots', rarity: 'mythic', basePrice: 9000, stats: { agility: 50, defense: 25, strength: 20, health: 250 }, icon: '👢' },
    { id: 'eternal_boots', name: 'Вічні чоботи', type: 'armor', slot: 'boots', rarity: 'mythic', basePrice: 9500, stats: { agility: 55, defense: 28, intelligence: 30, health: 280, mana: 150 }, icon: '👞' },
    { id: 'cosmic_treads', name: 'Космічні ходаки', type: 'armor', slot: 'boots', rarity: 'mythic', basePrice: 8800, stats: { agility: 52, defense: 22, strength: 25, health: 260 }, icon: '👢' },
    
    // Божественна
    { id: 'divine_boots', name: 'Божественні чоботи', type: 'armor', slot: 'boots', rarity: 'divine', basePrice: 45000, stats: { agility: 100, defense: 50, strength: 40, intelligence: 30, health: 600, mana: 300 }, icon: '👢' },
    { id: 'transcendent_boots', name: 'Трансцендентні чоботи', type: 'armor', slot: 'boots', rarity: 'divine', basePrice: 47000, stats: { agility: 110, defense: 55, strength: 45, intelligence: 35, health: 650, mana: 320 }, icon: '👞' },
    { id: 'supreme_greaves', name: 'Верховні поножі', type: 'armor', slot: 'boots', rarity: 'divine', basePrice: 46000, stats: { agility: 105, defense: 52, strength: 42, intelligence: 32, health: 620, mana: 310 }, icon: '👢' },
  ],
  helmets: [
    // Звичайна
    { id: 'leather_helmet', name: 'Шкіряний шолом', type: 'armor', slot: 'helmet', rarity: 'common', basePrice: 70, stats: { defense: 4 }, icon: '⛑️' },
    { id: 'cloth_cap', name: 'Тканинна шапка', type: 'armor', slot: 'helmet', rarity: 'common', basePrice: 65, stats: { defense: 3, intelligence: 2 }, icon: '⛑️' },
    { id: 'wool_hood', name: 'Вовняний капюшон', type: 'armor', slot: 'helmet', rarity: 'common', basePrice: 62, stats: { defense: 3, mana: 5 }, icon: '🎩' },
    { id: 'simple_cap', name: 'Проста шапка', type: 'armor', slot: 'helmet', rarity: 'common', basePrice: 60, stats: { defense: 3 }, icon: '⛑️' },
    { id: 'fur_hat', name: 'Хутряна шапка', type: 'armor', slot: 'helmet', rarity: 'common', basePrice: 68, stats: { defense: 4, health: 10 }, icon: '🎩' },
    
    // Постійна
    { id: 'copper_helmet', name: 'Мідний шолом', type: 'armor', slot: 'helmet', rarity: 'uncommon', basePrice: 170, stats: { defense: 6, strength: 2 }, icon: '⛑️' },
    { id: 'bronze_helmet', name: 'Бронзовий шолом', type: 'armor', slot: 'helmet', rarity: 'uncommon', basePrice: 180, stats: { defense: 7, strength: 3 }, icon: '⛑️' },
    { id: 'reinforced_helm', name: 'Підсилений шолом', type: 'armor', slot: 'helmet', rarity: 'uncommon', basePrice: 185, stats: { defense: 8, strength: 2 }, icon: '⛑️' },
    { id: 'hunter_hood', name: 'Капюшон мисливця', type: 'armor', slot: 'helmet', rarity: 'uncommon', basePrice: 175, stats: { defense: 6, agility: 4 }, icon: '🎩' },
    { id: 'scholar_hat', name: 'Шапка вченого', type: 'armor', slot: 'helmet', rarity: 'uncommon', basePrice: 172, stats: { defense: 5, intelligence: 7, mana: 18 }, icon: '🎓' },
    
    // Бойова
    { id: 'iron_helmet', name: 'Залізний шолом', type: 'armor', slot: 'helmet', rarity: 'combat', basePrice: 220, stats: { defense: 8, strength: 3 }, icon: '⛑️' },
    { id: 'steel_helmet', name: 'Сталевий шолом', type: 'armor', slot: 'helmet', rarity: 'combat', basePrice: 250, stats: { defense: 10, strength: 4 }, icon: '⛑️' },
    { id: 'mage_hat', name: 'Капелюх мага', type: 'armor', slot: 'helmet', rarity: 'combat', basePrice: 240, stats: { defense: 6, intelligence: 10, mana: 20 }, icon: '🎩' },
    { id: 'knight_helm', name: 'Лицарський шолом', type: 'armor', slot: 'helmet', rarity: 'combat', basePrice: 260, stats: { defense: 11, strength: 5 }, icon: '⛑️' },
    { id: 'battle_crown', name: 'Бойова корона', type: 'armor', slot: 'helmet', rarity: 'combat', basePrice: 255, stats: { defense: 9, strength: 4, intelligence: 4 }, icon: '👑' },
    { id: 'warrior_helm', name: 'Шолом воїна', type: 'armor', slot: 'helmet', rarity: 'combat', basePrice: 248, stats: { defense: 10, strength: 6, health: 20 }, icon: '⛑️' },
    
    // Епічна
    { id: 'dragon_helmet', name: 'Драконячий шолом', type: 'armor', slot: 'helmet', rarity: 'epic', basePrice: 800, stats: { defense: 15, strength: 10, health: 40 }, icon: '⛑️' },
    { id: 'void_helmet', name: 'Шолом порожнечі', type: 'armor', slot: 'helmet', rarity: 'epic', basePrice: 850, stats: { defense: 12, intelligence: 15, mana: 40 }, icon: '⛑️' },
    { id: 'archmage_hat', name: 'Капелюх архімага', type: 'armor', slot: 'helmet', rarity: 'epic', basePrice: 900, stats: { defense: 10, intelligence: 20, mana: 60 }, icon: '🎩' },
    { id: 'demon_helm', name: 'Демонічний шолом', type: 'armor', slot: 'helmet', rarity: 'epic', basePrice: 920, stats: { defense: 16, strength: 15, health: 50 }, icon: '⛑️' },
    { id: 'elemental_crown', name: 'Елементальна корона', type: 'armor', slot: 'helmet', rarity: 'epic', basePrice: 880, stats: { defense: 12, intelligence: 22, mana: 55 }, icon: '👑' },
    { id: 'shadow_helm', name: 'Тіньовий шолом', type: 'armor', slot: 'helmet', rarity: 'epic', basePrice: 910, stats: { defense: 14, agility: 12, intelligence: 14 }, icon: '⛑️' },
    
    // Легендарна
    { id: 'crown', name: 'Корона', type: 'armor', slot: 'helmet', rarity: 'legendary', basePrice: 3000, stats: { intelligence: 20, strength: 15, defense: 10 }, icon: '👑' },
    { id: 'phoenix_helmet', name: 'Шолом фенікса', type: 'armor', slot: 'helmet', rarity: 'legendary', basePrice: 3200, stats: { defense: 18, strength: 18, health: 120 }, icon: '⛑️' },
    { id: 'titan_helmet', name: 'Шолом титана', type: 'armor', slot: 'helmet', rarity: 'legendary', basePrice: 3500, stats: { defense: 25, strength: 20, health: 150 }, icon: '⛑️' },
    { id: 'celestial_crown', name: 'Небесна корона', type: 'armor', slot: 'helmet', rarity: 'legendary', basePrice: 3400, stats: { defense: 20, intelligence: 28, mana: 120, agility: 15 }, icon: '👑' },
    { id: 'infernal_helm', name: 'Пекельний шолом', type: 'armor', slot: 'helmet', rarity: 'legendary', basePrice: 3600, stats: { defense: 26, strength: 22, health: 160 }, icon: '⛑️' },
    
    // Міфічна
    { id: 'mythic_helmet', name: 'Міфічний шолом', type: 'armor', slot: 'helmet', rarity: 'mythic', basePrice: 10000, stats: { defense: 50, strength: 35, intelligence: 25, health: 400 }, icon: '⛑️' },
    { id: 'god_helmet', name: 'Шолом бога', type: 'armor', slot: 'helmet', rarity: 'mythic', basePrice: 12000, stats: { defense: 60, strength: 40, intelligence: 30, health: 500, mana: 200 }, icon: '⛑️' },
    { id: 'eternal_crown', name: 'Вічна корона', type: 'armor', slot: 'helmet', rarity: 'mythic', basePrice: 12500, stats: { defense: 55, intelligence: 45, mana: 250, health: 450, strength: 35 }, icon: '👑' },
    { id: 'cosmic_helm', name: 'Космічний шолом', type: 'armor', slot: 'helmet', rarity: 'mythic', basePrice: 11800, stats: { defense: 58, strength: 42, agility: 35, health: 480, intelligence: 28 }, icon: '⛑️' },
    
    // Божественна
    { id: 'divine_helmet', name: 'Божественний шолом', type: 'armor', slot: 'helmet', rarity: 'divine', basePrice: 50000, stats: { defense: 100, strength: 70, intelligence: 60, health: 1000, mana: 500 }, icon: '⛑️' },
    { id: 'transcendent_crown', name: 'Трансцендентна корона', type: 'armor', slot: 'helmet', rarity: 'divine', basePrice: 52000, stats: { defense: 95, intelligence: 80, mana: 600, health: 1100, strength: 65 }, icon: '👑' },
    { id: 'supreme_helm', name: 'Верховний шолом', type: 'armor', slot: 'helmet', rarity: 'divine', basePrice: 51000, stats: { defense: 105, strength: 75, agility: 65, intelligence: 65, health: 1050, mana: 520 }, icon: '⛑️' },
  ],
};

// Зілля та споживані предмети
export const POTIONS = [
  // Звичайна
  { id: 'health_potion_small', name: 'Зілля здоров\'я (мале)', type: 'potion', rarity: 'common', basePrice: 30, effect: { health: 30 }, stackable: true, icon: '🧪' },
  { id: 'health_potion', name: 'Зілля здоров\'я', type: 'potion', rarity: 'common', basePrice: 50, effect: { health: 50 }, stackable: true, icon: '🧪' },
  { id: 'mana_potion_small', name: 'Зілля мани (мале)', type: 'potion', rarity: 'common', basePrice: 25, effect: { mana: 25 }, stackable: true, icon: '✨' },
  { id: 'mana_potion', name: 'Зілля мани', type: 'potion', rarity: 'common', basePrice: 40, effect: { mana: 40 }, stackable: true, icon: '✨' },
  { id: 'minor_speed_potion', name: 'Зілля швидкості (мале)', type: 'potion', rarity: 'common', basePrice: 35, effect: { buff: { agility: 5, duration: 180 } }, stackable: true, icon: '🧪' },
  { id: 'weak_defense_potion', name: 'Зілля захисту (слабке)', type: 'potion', rarity: 'common', basePrice: 38, effect: { buff: { defense: 3, duration: 180 } }, stackable: true, icon: '🛡️' },
  
  // Постійна
  { id: 'health_potion_medium', name: 'Зілля здоров\'я (середнє)', type: 'potion', rarity: 'uncommon', basePrice: 70, effect: { health: 70 }, stackable: true, icon: '🧪' },
  { id: 'mana_potion_medium', name: 'Зілля мани (середнє)', type: 'potion', rarity: 'uncommon', basePrice: 55, effect: { mana: 55 }, stackable: true, icon: '✨' },
  { id: 'stamina_potion', name: 'Зілля витривалості', type: 'potion', rarity: 'uncommon', basePrice: 60, effect: { health: 40, mana: 40 }, stackable: true, icon: '💊' },
  { id: 'speed_potion', name: 'Зілля швидкості', type: 'potion', rarity: 'uncommon', basePrice: 65, effect: { buff: { agility: 8, duration: 240 } }, stackable: true, icon: '🧪' },
  { id: 'defense_potion', name: 'Зілля захисту', type: 'potion', rarity: 'uncommon', basePrice: 70, effect: { buff: { defense: 6, duration: 240 } }, stackable: true, icon: '🛡️' },
  { id: 'wisdom_potion', name: 'Зілля мудрості', type: 'potion', rarity: 'uncommon', basePrice: 68, effect: { buff: { intelligence: 7, duration: 240 } }, stackable: true, icon: '📚' },
  
  // Бойова
  { id: 'health_potion_large', name: 'Зілля здоров\'я (велике)', type: 'potion', rarity: 'combat', basePrice: 100, effect: { health: 100 }, stackable: true, icon: '🧪' },
  { id: 'mana_potion_large', name: 'Зілля мани (велике)', type: 'potion', rarity: 'combat', basePrice: 80, effect: { mana: 80 }, stackable: true, icon: '✨' },
  { id: 'regen_potion', name: 'Зілля регенерації', type: 'potion', rarity: 'combat', basePrice: 150, effect: { health: 50, mana: 50 }, stackable: true, icon: '💊' },
  { id: 'strength_potion', name: 'Зілля сили', type: 'potion', rarity: 'combat', basePrice: 200, effect: { buff: { strength: 10, duration: 300 } }, stackable: true, icon: '💪' },
  { id: 'greater_speed_potion', name: 'Велике зілля швидкості', type: 'potion', rarity: 'combat', basePrice: 180, effect: { buff: { agility: 12, duration: 300 } }, stackable: true, icon: '🧪' },
  { id: 'iron_skin_potion', name: 'Зілля залізної шкіри', type: 'potion', rarity: 'combat', basePrice: 210, effect: { buff: { defense: 10, duration: 300 } }, stackable: true, icon: '🛡️' },
  { id: 'focus_potion', name: 'Зілля концентрації', type: 'potion', rarity: 'combat', basePrice: 190, effect: { buff: { intelligence: 12, duration: 300 } }, stackable: true, icon: '🧠' },
  
  // Епічна
  { id: 'elixir', name: 'Еліксир', type: 'potion', rarity: 'epic', basePrice: 500, effect: { health: 200, mana: 200 }, stackable: true, icon: '⚗️' },
  { id: 'dragon_blood', name: 'Драконяча кров', type: 'potion', rarity: 'epic', basePrice: 600, effect: { health: 300, strength: 20 }, stackable: true, icon: '🩸' },
  { id: 'void_elixir', name: 'Еліксир порожнечі', type: 'potion', rarity: 'epic', basePrice: 700, effect: { health: 250, mana: 250, intelligence: 15 }, stackable: true, icon: '⚗️' },
  { id: 'berserker_brew', name: 'Відвар берсерка', type: 'potion', rarity: 'epic', basePrice: 750, effect: { buff: { strength: 25, agility: 15, duration: 360 } }, stackable: true, icon: '💪' },
  { id: 'mage_elixir', name: 'Еліксир мага', type: 'potion', rarity: 'epic', basePrice: 720, effect: { mana: 300, buff: { intelligence: 20, duration: 360 } }, stackable: true, icon: '🔮' },
  { id: 'stone_skin_elixir', name: 'Еліксир кам\'яної шкіри', type: 'potion', rarity: 'epic', basePrice: 680, effect: { health: 200, buff: { defense: 20, duration: 360 } }, stackable: true, icon: '🛡️' },
  
  // Легендарна
  { id: 'phoenix_elixir', name: 'Еліксир фенікса', type: 'potion', rarity: 'legendary', basePrice: 2000, effect: { health: 500, mana: 500, strength: 30, intelligence: 30 }, stackable: true, icon: '⚗️' },
  { id: 'titan_blood', name: 'Кров титана', type: 'potion', rarity: 'legendary', basePrice: 2500, effect: { health: 1000, strength: 50, defense: 20 }, stackable: true, icon: '🩸' },
  { id: 'supreme_power_elixir', name: 'Верховний еліксир сили', type: 'potion', rarity: 'legendary', basePrice: 2800, effect: { buff: { strength: 50, agility: 30, defense: 25, duration: 480 } }, stackable: true, icon: '💪' },
  { id: 'arcane_supremacy', name: 'Таємнича перевага', type: 'potion', rarity: 'legendary', basePrice: 2600, effect: { mana: 600, buff: { intelligence: 60, duration: 480 } }, stackable: true, icon: '✨' },
  
  // Міфічна
  { id: 'god_elixir', name: 'Еліксир бога', type: 'potion', rarity: 'mythic', basePrice: 10000, effect: { health: 2000, mana: 2000, strength: 100, intelligence: 100, defense: 50 }, stackable: true, icon: '⚗️' },
  { id: 'primordial_essence', name: 'Первісна есенція', type: 'potion', rarity: 'mythic', basePrice: 11000, effect: { health: 2500, mana: 2500, buff: { strength: 120, intelligence: 120, duration: 600 } }, stackable: true, icon: '🌟' },
  { id: 'eternal_vigor', name: 'Вічна бадьорість', type: 'potion', rarity: 'mythic', basePrice: 10500, effect: { health: 3000, buff: { strength: 100, defense: 80, duration: 600 } }, stackable: true, icon: '💪' },
  
  // Божественна
  { id: 'divine_elixir', name: 'Божественний еліксир', type: 'potion', rarity: 'divine', basePrice: 50000, effect: { health: 5000, mana: 5000, strength: 200, intelligence: 200, defense: 100, agility: 150 }, stackable: true, icon: '⚗️' },
  { id: 'transcendent_brew', name: 'Трансцендентний відвар', type: 'potion', rarity: 'divine', basePrice: 55000, effect: { health: 6000, mana: 6000, buff: { strength: 250, intelligence: 250, agility: 180, duration: 720 } }, stackable: true, icon: '🌌' },
  { id: 'omnipotent_elixir', name: 'Всемогутній еліксир', type: 'potion', rarity: 'divine', basePrice: 52000, effect: { health: 5500, mana: 5500, strength: 220, intelligence: 220, defense: 120, agility: 160 }, stackable: true, icon: '✨' },
];

// Їжа
export const FOOD = [
  // Звичайна
  { id: 'bread', name: 'Хліб', type: 'consumable', rarity: 'common', basePrice: 5, effect: { health: 10 }, stackable: true, icon: '🍞' },
  { id: 'apple', name: 'Яблуко', type: 'consumable', rarity: 'common', basePrice: 3, effect: { health: 5, mana: 5 }, stackable: true, icon: '🍎' },
  { id: 'meat', name: 'М\'ясо', type: 'consumable', rarity: 'common', basePrice: 10, effect: { health: 20 }, stackable: true, icon: '🍖' },
  { id: 'carrot', name: 'Морква', type: 'consumable', rarity: 'common', basePrice: 4, effect: { health: 8 }, stackable: true, icon: '🥕' },
  { id: 'potato', name: 'Картопля', type: 'consumable', rarity: 'common', basePrice: 3, effect: { health: 7 }, stackable: true, icon: '🥔' },
  { id: 'berries', name: 'Ягоди', type: 'consumable', rarity: 'common', basePrice: 6, effect: { health: 12, mana: 5 }, stackable: true, icon: '🫐' },
  { id: 'fish', name: 'Риба', type: 'consumable', rarity: 'common', basePrice: 8, effect: { health: 15 }, stackable: true, icon: '🐟' },
  
  // Постійна
  { id: 'cooked_meat', name: 'Приготоване м\'ясо', type: 'consumable', rarity: 'uncommon', basePrice: 25, effect: { health: 40 }, stackable: true, icon: '🍖' },
  { id: 'magic_apple', name: 'Магічне яблуко', type: 'consumable', rarity: 'uncommon', basePrice: 30, effect: { health: 30, mana: 30 }, stackable: true, icon: '🍎' },
  { id: 'roasted_chicken', name: 'Смажена курка', type: 'consumable', rarity: 'uncommon', basePrice: 28, effect: { health: 50 }, stackable: true, icon: '🍗' },
  { id: 'vegetable_stew', name: 'Овочеве рагу', type: 'consumable', rarity: 'uncommon', basePrice: 32, effect: { health: 45, mana: 20 }, stackable: true, icon: '🍲' },
  { id: 'cheese', name: 'Сир', type: 'consumable', rarity: 'uncommon', basePrice: 26, effect: { health: 40, buff: { defense: 3, duration: 180 } }, stackable: true, icon: '🧀' },
  
  // Бойова
  { id: 'golden_apple', name: 'Золоте яблуко', type: 'consumable', rarity: 'combat', basePrice: 100, effect: { health: 100, mana: 100 }, stackable: true, icon: '🍎' },
  { id: 'feast', name: 'Бенкет', type: 'consumable', rarity: 'combat', basePrice: 150, effect: { health: 150, mana: 100, strength: 5 }, stackable: true, icon: '🍽️' },
  { id: 'roast_beef', name: 'Смажена яловичина', type: 'consumable', rarity: 'combat', basePrice: 140, effect: { health: 130, buff: { strength: 8, duration: 240 } }, stackable: true, icon: '🥩' },
  { id: 'mana_cake', name: 'Манний пиріг', type: 'consumable', rarity: 'combat', basePrice: 120, effect: { mana: 120, buff: { intelligence: 10, duration: 240 } }, stackable: true, icon: '🍰' },
  { id: 'hero_meal', name: 'Страва героя', type: 'consumable', rarity: 'combat', basePrice: 160, effect: { health: 140, mana: 80, buff: { strength: 6, defense: 5, duration: 240 } }, stackable: true, icon: '🍱' },
  
  // Епічна
  { id: 'dragon_meat', name: 'Драконяче м\'ясо', type: 'consumable', rarity: 'epic', basePrice: 500, effect: { health: 300, strength: 20 }, stackable: true, icon: '🍖' },
  { id: 'ambrosia', name: 'Амброзія', type: 'consumable', rarity: 'epic', basePrice: 600, effect: { health: 400, mana: 400, intelligence: 25 }, stackable: true, icon: '🍯' },
  { id: 'celestial_nectar', name: 'Небесний нектар', type: 'consumable', rarity: 'epic', basePrice: 650, effect: { health: 350, mana: 450, buff: { intelligence: 30, duration: 360 } }, stackable: true, icon: '🍷' },
  { id: 'warrior_feast', name: 'Бенкет воїна', type: 'consumable', rarity: 'epic', basePrice: 620, effect: { health: 450, buff: { strength: 35, defense: 20, duration: 360 } }, stackable: true, icon: '🍗' },
  { id: 'enchanted_bread', name: 'Зачарований хліб', type: 'consumable', rarity: 'epic', basePrice: 580, effect: { health: 380, mana: 380, buff: { strength: 20, intelligence: 20, duration: 360 } }, stackable: true, icon: '🍞' },
  
  // Легендарна
  { id: 'phoenix_fruit', name: 'Плід фенікса', type: 'consumable', rarity: 'legendary', basePrice: 2000, effect: { health: 800, mana: 800, strength: 40, intelligence: 40 }, stackable: true, icon: '🍎' },
  { id: 'titan_meal', name: 'Страва титана', type: 'consumable', rarity: 'legendary', basePrice: 2200, effect: { health: 1000, buff: { strength: 60, defense: 40, duration: 480 } }, stackable: true, icon: '🍗' },
  { id: 'arcane_delicacy', name: 'Таємничий делікатес', type: 'consumable', rarity: 'legendary', basePrice: 2100, effect: { mana: 1000, buff: { intelligence: 70, duration: 480 } }, stackable: true, icon: '🍰' },
  
  // Міфічна
  { id: 'god_fruit', name: 'Плід бога', type: 'consumable', rarity: 'mythic', basePrice: 10000, effect: { health: 2000, mana: 2000, strength: 100, intelligence: 100 }, stackable: true, icon: '🍎' },
  { id: 'eternal_feast', name: 'Вічний бенкет', type: 'consumable', rarity: 'mythic', basePrice: 11000, effect: { health: 2500, mana: 2500, buff: { strength: 120, intelligence: 120, defense: 80, duration: 600 } }, stackable: true, icon: '🍽️' },
  { id: 'primordial_meal', name: 'Первісна страва', type: 'consumable', rarity: 'mythic', basePrice: 10500, effect: { health: 2200, mana: 2200, strength: 110, intelligence: 110, defense: 70 }, stackable: true, icon: '🍱' },
  
  // Божественна
  { id: 'divine_fruit', name: 'Божественний плід', type: 'consumable', rarity: 'divine', basePrice: 50000, effect: { health: 5000, mana: 5000, strength: 200, intelligence: 200, defense: 100 }, stackable: true, icon: '🍎' },
  { id: 'transcendent_banquet', name: 'Трансцендентний бенкет', type: 'consumable', rarity: 'divine', basePrice: 55000, effect: { health: 6000, mana: 6000, buff: { strength: 250, intelligence: 250, defense: 150, agility: 180, duration: 720 } }, stackable: true, icon: '🍽️' },
  { id: 'omnipotent_meal', name: 'Всемогутня страва', type: 'consumable', rarity: 'divine', basePrice: 52000, effect: { health: 5500, mana: 5500, strength: 220, intelligence: 220, defense: 120, agility: 160 }, stackable: true, icon: '🍱' },
];

// Скроли
export const SCROLLS = [
  // Звичайна
  { id: 'identify_scroll', name: 'Скрол ідентифікації', type: 'consumable', rarity: 'common', basePrice: 50, effect: { identify: true }, stackable: true, icon: '📜' },
  { id: 'minor_heal_scroll', name: 'Скрол малого лікування', type: 'consumable', rarity: 'common', basePrice: 40, effect: { health: 50 }, stackable: true, icon: '📜' },
  { id: 'minor_mana_scroll', name: 'Скрол малої мани', type: 'consumable', rarity: 'common', basePrice: 35, effect: { mana: 40 }, stackable: true, icon: '📜' },
  { id: 'light_scroll', name: 'Скрол світла', type: 'consumable', rarity: 'common', basePrice: 30, effect: { buff: { intelligence: 3, duration: 120 } }, stackable: true, icon: '📜' },
  
  // Постійна
  { id: 'heal_scroll', name: 'Скрол лікування', type: 'consumable', rarity: 'uncommon', basePrice: 80, effect: { health: 100 }, stackable: true, icon: '📜' },
  { id: 'mana_scroll', name: 'Скрол мани', type: 'consumable', rarity: 'uncommon', basePrice: 70, effect: { mana: 100 }, stackable: true, icon: '📜' },
  { id: 'protection_scroll', name: 'Скрол захисту', type: 'consumable', rarity: 'uncommon', basePrice: 75, effect: { buff: { defense: 8, duration: 240 } }, stackable: true, icon: '🛡️' },
  { id: 'power_scroll', name: 'Скрол сили', type: 'consumable', rarity: 'uncommon', basePrice: 80, effect: { buff: { strength: 10, duration: 240 } }, stackable: true, icon: '💪' },
  { id: 'clarity_scroll', name: 'Скрол ясності', type: 'consumable', rarity: 'uncommon', basePrice: 72, effect: { mana: 80, buff: { intelligence: 8, duration: 240 } }, stackable: true, icon: '🧠' },
  
  // Бойова
  { id: 'teleport_scroll', name: 'Скрол телепортації', type: 'consumable', rarity: 'combat', basePrice: 150, effect: { teleport: true }, stackable: true, icon: '📜' },
  { id: 'blessing_scroll', name: 'Скрол благословення', type: 'consumable', rarity: 'combat', basePrice: 200, effect: { buff: { strength: 15, defense: 10, duration: 600 } }, stackable: true, icon: '📜' },
  { id: 'haste_scroll', name: 'Скрол поспіху', type: 'consumable', rarity: 'combat', basePrice: 180, effect: { buff: { agility: 20, duration: 300 } }, stackable: true, icon: '💨' },
  { id: 'barrier_scroll', name: 'Скрол бар\'єру', type: 'consumable', rarity: 'combat', basePrice: 220, effect: { health: 150, buff: { defense: 15, duration: 300 } }, stackable: true, icon: '🛡️' },
  { id: 'wisdom_scroll', name: 'Скрол мудрості', type: 'consumable', rarity: 'combat', basePrice: 190, effect: { mana: 150, buff: { intelligence: 18, duration: 300 } }, stackable: true, icon: '📚' },
  
  // Епічна
  { id: 'resurrection_scroll', name: 'Скрол воскресіння', type: 'consumable', rarity: 'epic', basePrice: 1000, effect: { resurrection: true }, stackable: true, icon: '📜' },
  { id: 'mass_heal_scroll', name: 'Скрол масового лікування', type: 'consumable', rarity: 'epic', basePrice: 800, effect: { health: 500, mana: 500 }, stackable: true, icon: '📜' },
  { id: 'berserker_scroll', name: 'Скрол берсерка', type: 'consumable', rarity: 'epic', basePrice: 850, effect: { buff: { strength: 35, agility: 25, duration: 360 } }, stackable: true, icon: '💪' },
  { id: 'arcane_scroll', name: 'Таємничий скрол', type: 'consumable', rarity: 'epic', basePrice: 820, effect: { mana: 600, buff: { intelligence: 40, duration: 360 } }, stackable: true, icon: '✨' },
  { id: 'invincibility_scroll', name: 'Скрол непереможності', type: 'consumable', rarity: 'epic', basePrice: 900, effect: { health: 400, buff: { defense: 35, duration: 360 } }, stackable: true, icon: '🛡️' },
  
  // Легендарна
  { id: 'divine_scroll', name: 'Божественний скрол', type: 'consumable', rarity: 'legendary', basePrice: 5000, effect: { health: 2000, mana: 2000, strength: 50, intelligence: 50 }, stackable: true, icon: '📜' },
  { id: 'titan_blessing', name: 'Благословення титана', type: 'consumable', rarity: 'legendary', basePrice: 5500, effect: { health: 1500, buff: { strength: 70, defense: 50, duration: 480 } }, stackable: true, icon: '📜' },
  { id: 'supreme_summoning', name: 'Верховний призов', type: 'consumable', rarity: 'legendary', basePrice: 5200, effect: { buff: { strength: 60, intelligence: 60, agility: 40, duration: 480 } }, stackable: true, icon: '📜' },
  
  // Міфічна
  { id: 'mythic_scroll', name: 'Міфічний скрол', type: 'consumable', rarity: 'mythic', basePrice: 20000, effect: { health: 5000, mana: 5000, strength: 100, intelligence: 100, defense: 50 }, stackable: true, icon: '📜' },
  { id: 'eternal_blessing', name: 'Вічне благословення', type: 'consumable', rarity: 'mythic', basePrice: 21000, effect: { health: 4000, mana: 4000, buff: { strength: 120, intelligence: 120, defense: 80, duration: 600 } }, stackable: true, icon: '✨' },
  { id: 'primordial_scroll', name: 'Первісний скрол', type: 'consumable', rarity: 'mythic', basePrice: 22000, effect: { health: 6000, mana: 6000, strength: 110, intelligence: 110, defense: 70 }, stackable: true, icon: '🌟' },
  
  // Божественна
  { id: 'creation_scroll', name: 'Скрол творіння', type: 'consumable', rarity: 'divine', basePrice: 100000, effect: { health: 10000, mana: 10000, strength: 200, intelligence: 200, defense: 100, agility: 150 }, stackable: true, icon: '📜' },
  { id: 'transcendent_blessing', name: 'Трансцендентне благословення', type: 'consumable', rarity: 'divine', basePrice: 110000, effect: { health: 8000, mana: 8000, buff: { strength: 250, intelligence: 250, defense: 150, agility: 180, duration: 720 } }, stackable: true, icon: '🌌' },
  { id: 'omnipotent_scroll', name: 'Всемогутній скрол', type: 'consumable', rarity: 'divine', basePrice: 105000, effect: { health: 12000, mana: 12000, strength: 220, intelligence: 220, defense: 120, agility: 160 }, stackable: true, icon: '✨' },
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
  
  // Додаткові спеціальні предмети
  // Ключі
  { id: 'silver_key', name: 'Срібний ключ', type: 'special', rarity: 'uncommon', basePrice: 150, icon: '🗝️' },
  { id: 'gold_key', name: 'Золотий ключ', type: 'special', rarity: 'combat', basePrice: 250, icon: '🗝️' },
  { id: 'master_key', name: 'Майстер-ключ', type: 'special', rarity: 'epic', basePrice: 600, icon: '🗝️' },
  { id: 'void_key', name: 'Ключ порожнечі', type: 'special', rarity: 'legendary', basePrice: 3000, icon: '🗝️' },
  
  // Талісмани
  { id: 'luck_talisman', name: 'Талісман удачі', type: 'special', rarity: 'uncommon', basePrice: 200, stats: { agility: 5 }, icon: '🍀' },
  { id: 'strength_talisman', name: 'Талісман сили', type: 'special', rarity: 'combat', basePrice: 400, stats: { strength: 10 }, icon: '💪' },
  { id: 'wisdom_talisman', name: 'Талісман мудрості', type: 'special', rarity: 'combat', basePrice: 380, stats: { intelligence: 10 }, icon: '📚' },
  { id: 'guardian_talisman', name: 'Талісман захисника', type: 'special', rarity: 'epic', basePrice: 900, stats: { defense: 20, health: 80 }, icon: '🛡️' },
  { id: 'dragon_talisman', name: 'Драконячий талісман', type: 'special', rarity: 'legendary', basePrice: 4000, stats: { strength: 40, defense: 20, health: 150 }, icon: '🐉' },
  { id: 'cosmic_talisman', name: 'Космічний талісман', type: 'special', rarity: 'mythic', basePrice: 18000, stats: { strength: 80, intelligence: 80, defense: 40, health: 400, mana: 400 }, icon: '🌌' },
  
  // Квестові предмети
  { id: 'ancient_map', name: 'Стародавня карта', type: 'special', rarity: 'combat', basePrice: 0, icon: '🗺️' },
  { id: 'royal_seal', name: 'Королівська печатка', type: 'special', rarity: 'epic', basePrice: 0, icon: '👑' },
  { id: 'prophecy_scroll', name: 'Скрол пророцтва', type: 'special', rarity: 'legendary', basePrice: 0, icon: '📜' },
  
  // Колекційні артефакти
  { id: 'ancient_coin', name: 'Стародавня монета', type: 'special', rarity: 'uncommon', basePrice: 100, icon: '🪙' },
  { id: 'mysterious_orb', name: 'Таємнича сфера', type: 'special', rarity: 'combat', basePrice: 500, stats: { intelligence: 8, mana: 20 }, icon: '🔮' },
  { id: 'runic_stone', name: 'Рунічний камінь', type: 'special', rarity: 'epic', basePrice: 1200, stats: { intelligence: 18, mana: 50 }, icon: '🗿' },
  { id: 'time_crystal', name: 'Кристал часу', type: 'special', rarity: 'legendary', basePrice: 6000, stats: { agility: 30, intelligence: 30 }, icon: '⏳' },
  { id: 'infinity_gem', name: 'Самоцвіт нескінченності', type: 'special', rarity: 'mythic', basePrice: 35000, stats: { strength: 90, intelligence: 90, agility: 60, defense: 50, health: 600, mana: 600 }, icon: '💎' },
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
