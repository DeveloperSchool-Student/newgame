import { useState } from 'react';
import { RACES, getAllRaces } from '../../data/races';
import { KINGDOMS } from '../../data/kingdoms';

export const CharacterCreation = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedKingdom, setSelectedKingdom] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);

  const races = getAllRaces();
  const kingdoms = Object.values(KINGDOMS);

  // Класи персонажа
  const classes = [
    {
      id: 'warrior',
      name: 'Воїн',
      emoji: '⚔️',
      description: 'Майстер ближнього бою з високою витривалістю',
      bonuses: { strength: +5, defense: +3 },
    },
    {
      id: 'mage',
      name: 'Маг',
      emoji: '🧙',
      description: 'Володар магії стихій з потужними заклинаннями',
      bonuses: { intelligence: +5, mana: +30 },
    },
    {
      id: 'rogue',
      name: 'Розвідник',
      emoji: '🗡️',
      description: 'Швидкий та спритний майстер критичних ударів',
      bonuses: { agility: +5, luck: +3 },
    },
    {
      id: 'paladin',
      name: 'Паладін',
      emoji: '🛡️',
      description: 'Святий воїн з лікувальними здібностями',
      bonuses: { defense: +4, intelligence: +2, health: +20 },
    },
    {
      id: 'ranger',
      name: 'Рейнджер',
      emoji: '🏹',
      description: 'Лучник та мисливець, майстер дальнього бою',
      bonuses: { agility: +4, strength: +2 },
    },
    {
      id: 'necromancer',
      name: 'Некромант',
      emoji: '💀',
      description: 'Повелитель мертвих та темної магії',
      bonuses: { intelligence: +4, mana: +25, luck: -2 },
    },
  ];

  const handleRaceSelect = (race) => {
    setSelectedRace(race);
  };

  const handleKingdomSelect = (kingdom) => {
    setSelectedKingdom(kingdom);
  };

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
  };

  const handleNext = () => {
    if (step === 1 && selectedRace) {
      setStep(2);
    } else if (step === 2 && selectedKingdom) {
      setStep(3);
    } else if (step === 3 && selectedClass) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    if (!characterName.trim()) {
      alert('Введіть ім\'я персонажа!');
      return;
    }

    onComplete({
      race: selectedRace,
      kingdom: selectedKingdom,
      class: selectedClass,
      name: characterName.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

      <div className="relative w-11/12 max-w-4xl bg-fantasy-dark border-4 border-fantasy-gold rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-fantasy-gold/20 via-fantasy-red/20 to-fantasy-gold/20 px-8 py-6 border-b-2 border-fantasy-gold">
          <h1 className="text-4xl font-bold text-fantasy-gold text-center mb-2">
            ⚔️ Створення Персонажа ⚔️
          </h1>
          <div className="flex justify-center space-x-4 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  s === step
                    ? 'bg-fantasy-gold text-fantasy-dark scale-110'
                    : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
            ))}
          </div>
          <div className="text-center text-white mt-3">
            {step === 1 && 'Крок 1: Виберіть расу'}
            {step === 2 && 'Крок 2: Виберіть королівство'}
            {step === 3 && 'Крок 3: Виберіть клас'}
            {step === 4 && 'Крок 4: Завершення'}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Race Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-fantasy-gold mb-4">Виберіть расу</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {races.map((race) => (
                  <div
                    key={race.id}
                    onClick={() => handleRaceSelect(race)}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:scale-105 ${
                      selectedRace?.id === race.id
                        ? 'border-fantasy-gold bg-fantasy-gold/20 shadow-lg'
                        : 'border-gray-600 bg-fantasy-dark/50 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-5xl text-center mb-2">{race.emoji}</div>
                    <div className="text-white font-bold text-center mb-2">{race.name}</div>
                    <div className="text-gray-400 text-xs text-center">{race.description}</div>
                  </div>
                ))}
              </div>

              {selectedRace && (
                <div className="mt-6 bg-fantasy-dark/70 border border-fantasy-gold/50 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-fantasy-gold mb-3">
                    {selectedRace.emoji} {selectedRace.name}
                  </h3>
                  <p className="text-gray-300 mb-3">{selectedRace.lore}</p>
                  <div className="mb-3">
                    <div className="text-green-400 font-semibold mb-1">✨ Особливість:</div>
                    <div className="text-white">{selectedRace.special}</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="text-red-400">❤️ HP: +{selectedRace.bonuses.health}</div>
                    <div className="text-blue-400">💧 Мана: +{selectedRace.bonuses.mana}</div>
                    <div className="text-orange-400">💪 Сила: +{selectedRace.bonuses.strength}</div>
                    <div className="text-green-400">⚡ Спритність: +{selectedRace.bonuses.agility}</div>
                    <div className="text-purple-400">🧠 Інтелект: +{selectedRace.bonuses.intelligence}</div>
                    <div className="text-gray-400">🛡️ Захист: +{selectedRace.bonuses.defense}</div>
                    <div className="text-yellow-400">🍀 Удача: +{selectedRace.bonuses.luck}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Kingdom Selection */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-fantasy-gold mb-4">Виберіть початкове королівство</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kingdoms.map((kingdom) => (
                  <div
                    key={kingdom.id}
                    onClick={() => handleKingdomSelect(kingdom)}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:scale-105 ${
                      selectedKingdom?.id === kingdom.id
                        ? 'border-fantasy-gold bg-fantasy-gold/20 shadow-lg'
                        : 'border-gray-600 bg-fantasy-dark/50 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-4xl mb-2">{kingdom.flagEmoji}</div>
                    <div className="text-white font-bold mb-1" style={{ color: kingdom.color }}>
                      {kingdom.name}
                    </div>
                    <div className="text-gray-400 text-sm">{kingdom.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Class Selection */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-fantasy-gold mb-4">Виберіть клас персонажа</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((classData) => (
                  <div
                    key={classData.id}
                    onClick={() => handleClassSelect(classData)}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:scale-105 ${
                      selectedClass?.id === classData.id
                        ? 'border-fantasy-gold bg-fantasy-gold/20 shadow-lg'
                        : 'border-gray-600 bg-fantasy-dark/50 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-5xl text-center mb-2">{classData.emoji}</div>
                    <div className="text-white font-bold text-center mb-2">{classData.name}</div>
                    <div className="text-gray-400 text-sm text-center mb-3">{classData.description}</div>
                    <div className="text-xs text-green-400">
                      {Object.entries(classData.bonuses).map(([stat, value]) => (
                        <div key={stat}>
                          {stat}: {value > 0 ? '+' : ''}{value}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Finalization */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-fantasy-gold mb-4">Завершення створення</h2>
              
              {/* Character Name */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">Ім'я персонажа:</label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Введіть ім'я..."
                  maxLength={20}
                  className="w-full bg-fantasy-dark border-2 border-fantasy-gold/50 rounded-lg px-4 py-3 text-white text-lg focus:border-fantasy-gold focus:outline-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-fantasy-dark/70 border border-fantasy-gold/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-fantasy-gold mb-4">Підсумок персонажа</h3>
                
                <div className="space-y-4">
                  {/* Race */}
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{selectedRace?.emoji}</div>
                    <div>
                      <div className="text-gray-400 text-sm">Раса:</div>
                      <div className="text-white font-bold">{selectedRace?.name}</div>
                    </div>
                  </div>

                  {/* Kingdom */}
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{selectedKingdom?.flagEmoji}</div>
                    <div>
                      <div className="text-gray-400 text-sm">Королівство:</div>
                      <div className="text-white font-bold" style={{ color: selectedKingdom?.color }}>
                        {selectedKingdom?.name}
                      </div>
                    </div>
                  </div>

                  {/* Class */}
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{selectedClass?.emoji}</div>
                    <div>
                      <div className="text-gray-400 text-sm">Клас:</div>
                      <div className="text-white font-bold">{selectedClass?.name}</div>
                    </div>
                  </div>

                  {/* Total Stats Preview */}
                  <div className="mt-4 pt-4 border-t border-fantasy-gold/30">
                    <div className="text-fantasy-gold font-semibold mb-2">Початкові характеристики:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-red-400">
                        ❤️ Здоров'я: {selectedRace?.bonuses.health + (selectedClass?.bonuses.health || 0)}
                      </div>
                      <div className="text-blue-400">
                        💧 Мана: {selectedRace?.bonuses.mana + (selectedClass?.bonuses.mana || 0)}
                      </div>
                      <div className="text-orange-400">
                        💪 Сила: {selectedRace?.bonuses.strength + (selectedClass?.bonuses.strength || 0)}
                      </div>
                      <div className="text-green-400">
                        ⚡ Спритність: {selectedRace?.bonuses.agility + (selectedClass?.bonuses.agility || 0)}
                      </div>
                      <div className="text-purple-400">
                        🧠 Інтелект: {selectedRace?.bonuses.intelligence + (selectedClass?.bonuses.intelligence || 0)}
                      </div>
                      <div className="text-gray-400">
                        🛡️ Захист: {selectedRace?.bonuses.defense + (selectedClass?.bonuses.defense || 0)}
                      </div>
                      <div className="text-yellow-400">
                        🍀 Удача: {selectedRace?.bonuses.luck + (selectedClass?.bonuses.luck || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-fantasy-dark/80 px-8 py-4 border-t-2 border-fantasy-gold flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              step === 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            ← Назад
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !selectedRace) ||
                (step === 2 && !selectedKingdom) ||
                (step === 3 && !selectedClass)
              }
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                (step === 1 && !selectedRace) ||
                (step === 2 && !selectedKingdom) ||
                (step === 3 && !selectedClass)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-fantasy-gold text-fantasy-dark hover:bg-yellow-500'
              }`}
            >
              Далі →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!characterName.trim()}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                !characterName.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-500'
              }`}
            >
              ✓ Розпочати пригоду!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

