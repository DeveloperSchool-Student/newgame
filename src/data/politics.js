// Система посад у королівстві

// Посади в королівстві
export const KINGDOM_POSITIONS = {
  // Вища влада
  king: {
    id: 'king',
    name: 'Король/Королева',
    emoji: '👑',
    description: 'Верховний правитель королівства',
    maxCount: 1,
    requirements: {
      minLevel: 50,
      minReputation: 10000,
    },
    powers: [
      'Призначення на всі посади',
      'Оголошення війни',
      'Укладання миру',
      'Вето на рішення ради',
      'Контроль скарбниці',
    ],
    salary: 5000, // Золото на день
    influence: 1000,
  },

  // Рада королівства (5 місць)
  councilMember: {
    id: 'councilMember',
    name: 'Член Ради Королівства',
    emoji: '🏛️',
    description: 'Входить до найвищого органу влади',
    maxCount: 5,
    requirements: {
      minLevel: 35,
      minReputation: 5000,
    },
    powers: [
      'Голосування за закони',
      'Пропозиція законів',
      'Імпічмент короля (3/5 голосів)',
      'Затвердження бюджету',
    ],
    salary: 2000,
    influence: 500,
  },

  // Військові посади
  commander: {
    id: 'commander',
    name: 'Командувач Гвардії',
    emoji: '⚔️',
    description: 'Керує королівською гвардією',
    maxCount: 1,
    requirements: {
      minLevel: 40,
      minReputation: 6000,
      minStats: { strength: 50 },
    },
    powers: [
      'Командування військом',
      'Призначення офіцерів',
      'Організація оборони',
      'Арешт гравців',
    ],
    salary: 2500,
    influence: 600,
  },

  guard: {
    id: 'guard',
    name: 'Королівська Гвардія',
    emoji: '🛡️',
    description: 'Елітний воїн на службі королівства',
    maxCount: 10,
    requirements: {
      minLevel: 25,
      minStats: { strength: 30 },
    },
    powers: [
      'Патрулювання провінцій',
      'Захист короля',
      'Арешт порушників',
    ],
    salary: 1000,
    influence: 200,
  },

  // Адміністративні посади
  chancellor: {
    id: 'chancellor',
    name: 'Канцлер',
    emoji: '📜',
    description: 'Головний радник короля',
    maxCount: 1,
    requirements: {
      minLevel: 45,
      minReputation: 7000,
      minStats: { intelligence: 60 },
    },
    powers: [
      'Ведення переговорів',
      'Управління дипломатією',
      'Консультування короля',
      'Вплив на рішення',
    ],
    salary: 3000,
    influence: 700,
  },

  treasurer: {
    id: 'treasurer',
    name: 'Скарбник',
    emoji: '💰',
    description: 'Керує фінансами королівства',
    maxCount: 1,
    requirements: {
      minLevel: 35,
      minReputation: 5000,
      minStats: { intelligence: 40 },
    },
    powers: [
      'Управління скарбницею',
      'Встановлення податків',
      'Розподіл бюджету',
      'Фінансові звіти',
    ],
    salary: 2500,
    influence: 500,
  },

  // Провінційна влада
  governor: {
    id: 'governor',
    name: 'Намісник Провінції',
    emoji: '🏰',
    description: 'Управляє конкретною провінцією',
    maxCount: 21, // По одному на кожну провінцію
    requirements: {
      minLevel: 20,
      minReputation: 2000,
    },
    powers: [
      'Управління провінцією',
      'Збір податків',
      'Місцеві закони',
      'Призначення шерифів',
    ],
    salary: 800,
    influence: 300,
  },

  sheriff: {
    id: 'sheriff',
    name: 'Шериф',
    emoji: '👮',
    description: 'Підтримує порядок у провінції',
    maxCount: 21,
    requirements: {
      minLevel: 15,
    },
    powers: [
      'Підтримка порядку',
      'Розслідування',
      'Затримання',
    ],
    salary: 500,
    influence: 100,
  },

  // Спеціальні посади
  spymaster: {
    id: 'spymaster',
    name: 'Майстер Шпигунів',
    emoji: '🕵️',
    description: 'Керує розвідкою королівства',
    maxCount: 1,
    requirements: {
      minLevel: 40,
      minReputation: 5000,
      minStats: { agility: 50 },
    },
    powers: [
      'Шпигунство',
      'Контррозвідка',
      'Розкриття змов',
      'Таємні операції',
    ],
    salary: 3000,
    influence: 600,
  },

  highPriest: {
    id: 'highPriest',
    name: 'Верховний Жрець',
    emoji: '⛪',
    description: 'Духовний лідер королівства',
    maxCount: 1,
    requirements: {
      minLevel: 35,
      minReputation: 6000,
      minStats: { intelligence: 45 },
    },
    powers: [
      'Благословення',
      'Коронація',
      'Духовне керівництво',
      'Моральний авторитет',
    ],
    salary: 2000,
    influence: 500,
  },

  ambassador: {
    id: 'ambassador',
    name: 'Посол',
    emoji: '🤝',
    description: 'Представляє королівство в інших державах',
    maxCount: 5,
    requirements: {
      minLevel: 30,
      minReputation: 3000,
    },
    powers: [
      'Переговори з іншими королівствами',
      'Укладання альянсів',
      'Торгові угоди',
    ],
    salary: 1500,
    influence: 300,
  },
};

// Типи інтриг (без процентів, треба шукати докази)
export const INTRIGUE_TYPES = {
  investigation: {
    id: 'investigation',
    name: 'Розслідування',
    emoji: '🔍',
    description: 'Почати розслідування проти гравця. Потрібно зібрати докази.',
    cost: 1000,
    duration: 3, // дні
    evidenceRequired: 3, // кількість доказів для успіху
    requirements: {
      minLevel: 20,
      minGold: 1000,
    },
    possibleOutcomes: [
      'Усунення з посади',
      'Втрата репутації',
      'Арешт',
      'Вигнання з королівства',
    ],
  },

  searchEvidence: {
    id: 'searchEvidence',
    name: 'Пошук доказів',
    emoji: '📜',
    description: 'Шукати докази проти гравця. Може зайняти час.',
    cost: 500,
    cooldown: 6, // годин
    requirements: {
      minLevel: 15,
      minGold: 500,
    },
    evidenceTypes: [
      'Листування',
      'Свідок',
      'Фінансові документи',
      'Улики',
    ],
  },

  createConspiracy: {
    id: 'createConspiracy',
    name: 'Створити змову',
    emoji: '🤝',
    description: 'Створити таємну змову для об\'єднання зусиль проти цілі',
    cost: 2000,
    requirements: {
      minLevel: 25,
      minGold: 2000,
    },
    minMembers: 2,
    maxMembers: 10,
  },

  joinConspiracy: {
    id: 'joinConspiracy',
    name: 'Приєднатися до змови',
    emoji: '🤫',
    description: 'Приєднатися до існуючої змови',
    cost: 500,
    requirements: {
      minLevel: 15,
      minGold: 500,
    },
  },

  executeConspiracy: {
    id: 'executeConspiracy',
    name: 'Виконати змову',
    emoji: '⚔️',
    description: 'Виконати план змови. Успіх залежить від кількості учасників та доказів.',
    cost: 0,
    requirements: {
      minMembers: 3,
      minEvidence: 5,
    },
  },

  counterIntrigue: {
    id: 'counterIntrigue',
    name: 'Контр-інтрига',
    emoji: '🛡️',
    description: 'Захиститися від інтриги або викрити змовників',
    cost: 1500,
    requirements: {
      minLevel: 20,
      minGold: 1500,
    },
  },
};

// Типи законів для голосування в раді
export const LAW_TYPES = {
  taxation: {
    id: 'taxation',
    name: 'Податкова реформа',
    emoji: '💸',
    description: 'Зміна ставки податків',
    effects: 'Збільшення/зменшення податків на 5%',
  },

  military: {
    id: 'military',
    name: 'Військовий призов',
    emoji: '⚔️',
    description: 'Збільшення військової міці',
    effects: 'Бонус до сили армії +10%',
  },

  trade: {
    id: 'trade',
    name: 'Торгова угода',
    emoji: '🤝',
    description: 'Відкриття торгових шляхів',
    effects: 'Знижка на товари в магазині -10%',
  },

  expansion: {
    id: 'expansion',
    name: 'Територіальна експансія',
    emoji: '🗺️',
    description: 'Дозвіл на захоплення нових земель',
    effects: 'Бонус до захоплення провінцій',
  },

  welfare: {
    id: 'welfare',
    name: 'Соціальне забезпечення',
    emoji: '❤️',
    description: 'Підтримка населення',
    effects: 'Бонус до репутації +5%',
  },
};

// Функція для перевірки вимог до посади
export const checkPositionRequirements = (position, player) => {
  const pos = KINGDOM_POSITIONS[position];
  if (!pos) return { valid: false, reason: 'Посада не існує' };

  // Перевірка рівня
  if (pos.requirements.minLevel && player.level < pos.requirements.minLevel) {
    return { valid: false, reason: `Потрібен рівень ${pos.requirements.minLevel}` };
  }

  // Перевірка репутації
  if (pos.requirements.minReputation && (player.reputation || 0) < pos.requirements.minReputation) {
    return { valid: false, reason: `Потрібна репутація ${pos.requirements.minReputation}` };
  }

  // Перевірка статів
  if (pos.requirements.minStats) {
    for (const [stat, minValue] of Object.entries(pos.requirements.minStats)) {
      if ((player.stats[stat] || 0) < minValue) {
        return { valid: false, reason: `Потрібен ${stat}: ${minValue}` };
      }
    }
  }

  return { valid: true };
};

// Типи доказів
export const EVIDENCE_TYPES = {
  correspondence: {
    id: 'correspondence',
    name: 'Листування',
    emoji: '📧',
    weight: 1, // вага доказу
    difficulty: 'medium',
  },
  witness: {
    id: 'witness',
    name: 'Свідок',
    emoji: '👤',
    weight: 2,
    difficulty: 'hard',
  },
  financial: {
    id: 'financial',
    name: 'Фінансові документи',
    emoji: '💵',
    weight: 2,
    difficulty: 'hard',
  },
  physical: {
    id: 'physical',
    name: 'Фізичні улики',
    emoji: '🔪',
    weight: 3,
    difficulty: 'very_hard',
  },
  confession: {
    id: 'confession',
    name: 'Зізнання',
    emoji: '🗣️',
    weight: 5,
    difficulty: 'extreme',
  },
};

// Функція для розрахунку успіху змови
export const calculateConspiracyStrength = (conspiracy) => {
  if (!conspiracy) return 0;

  let strength = 0;

  // Кількість учасників
  strength += (conspiracy.members?.length || 0) * 10;

  // Загальна кількість доказів
  strength += (conspiracy.evidence?.length || 0) * 15;

  // Вага доказів
  if (conspiracy.evidence) {
    conspiracy.evidence.forEach(ev => {
      const evidenceType = EVIDENCE_TYPES[ev.type];
      if (evidenceType) {
        strength += evidenceType.weight * 5;
      }
    });
  }

  // Рівні учасників
  if (conspiracy.members) {
    const avgLevel = conspiracy.members.reduce((sum, m) => sum + (m.level || 1), 0) / conspiracy.members.length;
    strength += avgLevel;
  }

  // Час існування (чим довше існує, тим більше ризик викриття)
  const daysExisted = conspiracy.daysExisted || 0;
  if (daysExisted > 7) {
    strength -= (daysExisted - 7) * 5; // штраф за тривале існування
  }

  return Math.max(0, strength);
};

// Функція для обчислення ризику викриття
export const calculateDetectionRisk = (conspiracy) => {
  if (!conspiracy) return 0;

  let risk = 10; // базовий ризик

  // Більше учасників = більший ризик
  risk += (conspiracy.members?.length || 0) * 5;

  // Час існування
  const daysExisted = conspiracy.daysExisted || 0;
  risk += daysExisted * 3;

  // Якщо є Майстер Шпигунів в королівстві
  if (conspiracy.spymasterInKingdom) {
    risk += 30;
  }

  return Math.min(100, risk);
};

