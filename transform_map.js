const fs = require('fs');
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

const transformPoint = (x, y) => {
    const cx = 50;
    const cy = 50;
    const factor = 0.6;
    const nx = cx + (x - cx) * factor;
    const ny = cy + (y - cy) * factor;
    return { x: Math.round(nx * 10) / 10, y: Math.round(ny * 10) / 10 };
}

const transformPathString = (pathStr) => {
    const parts = pathStr.split(' ');
    const newParts = [];
    let currentCoordIndex = 0;

    for (let part of parts) {
        if (/[MmLlZz]/.test(part)) {
            newParts.push(part);
        } else if (!isNaN(parseFloat(part))) {
            const val = parseFloat(part);
            if (currentCoordIndex === 0) {
                const { x } = transformPoint(val, 0);
                newParts.push(x);
                currentCoordIndex = 1;
            } else {
                const { y } = transformPoint(0, val);
                newParts.push(y);
                currentCoordIndex = 0;
            }
        } else {
            newParts.push(part);
        }
    }
    return newParts.join(' ');
}

const newRegions = {};
for (const key in regions) {
    const r = regions[key];
    const { x, y } = transformPoint(r.position.x, r.position.y);
    newRegions[key] = {
        ...r,
        position: { x, y },
        path: transformPathString(r.path)
    };
}

fs.writeFileSync('regions_new.json', JSON.stringify(newRegions, null, 2));
