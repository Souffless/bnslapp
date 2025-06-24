export interface Exercise {
  id: string;
  name: string;
  type: 'reps' | 'time' | 'steps';
  unit: string;
  baseAmount: number;
  completed: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  difficulty: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'AA' | 'AAA' | 'S' | 'SS' | 'SSS' | 'SSS+';
  xpReward: number;
  exercises: Exercise[];
  date: string;
  completed: boolean;
  isSpecial?: boolean;
}

const bodyweightExercises = [
  { name: 'Push-ups', type: 'reps' as const, unit: 'reps', baseAmount: 10 },
  { name: 'Squats', type: 'reps' as const, unit: 'reps', baseAmount: 15 },
  { name: 'Burpees', type: 'reps' as const, unit: 'reps', baseAmount: 5 },
  { name: 'Mountain Climbers', type: 'reps' as const, unit: 'reps', baseAmount: 20 },
  { name: 'Jumping Jacks', type: 'reps' as const, unit: 'reps', baseAmount: 25 },
  { name: 'Lunges', type: 'reps' as const, unit: 'reps', baseAmount: 12 },
  { name: 'Plank Hold', type: 'time' as const, unit: 'seconds', baseAmount: 30 },
  { name: 'High Knees', type: 'reps' as const, unit: 'reps', baseAmount: 30 },
  { name: 'Crunches', type: 'reps' as const, unit: 'reps', baseAmount: 20 },
  { name: 'Wall Sit', type: 'time' as const, unit: 'seconds', baseAmount: 45 },
  { name: 'Tricep Dips', type: 'reps' as const, unit: 'reps', baseAmount: 8 },
  { name: 'Glute Bridges', type: 'reps' as const, unit: 'reps', baseAmount: 15 },
];

const walkingExercise = { name: 'Walking', type: 'steps' as const, unit: 'steps', baseAmount: 2000 };

const difficulties = ['F', 'E', 'D', 'C', 'B', 'A', 'AA', 'AAA', 'S', 'SS', 'SSS', 'SSS+'] as const;

const difficultyMultipliers = {
  'F': { exercise: 0.5, xp: 200 },
  'E': { exercise: 0.7, xp: 350 },
  'D': { exercise: 0.9, xp: 500 },
  'C': { exercise: 1.1, xp: 700 },
  'B': { exercise: 1.3, xp: 950 },
  'A': { exercise: 1.6, xp: 1250 },
  'AA': { exercise: 2.0, xp: 1600 },
  'AAA': { exercise: 2.5, xp: 2000 },
  'S': { exercise: 3.0, xp: 2500 },
  'SS': { exercise: 3.5, xp: 3100 },
  'SSS': { exercise: 4.0, xp: 3800 },
  'SSS+': { exercise: 5.0, xp: 5000 }
};

function getPlayerRank(level: number): typeof difficulties[number] {
  if (level >= 100) return 'SSS+';
  if (level >= 90) return 'SSS';
  if (level >= 80) return 'SS';
  if (level >= 70) return 'S';
  if (level >= 60) return 'AAA';
  if (level >= 50) return 'AA';
  if (level >= 40) return 'A';
  if (level >= 30) return 'B';
  if (level >= 20) return 'C';
  if (level >= 15) return 'D';
  if (level >= 10) return 'E';
  return 'F';
}

function getQuestDifficultyProbabilities(playerRank: typeof difficulties[number]): Record<typeof difficulties[number], number> {
  const playerRankIndex = difficulties.indexOf(playerRank);
  const probabilities: Record<typeof difficulties[number], number> = {
    'F': 0, 'E': 0, 'D': 0, 'C': 0, 'B': 0, 'A': 0, 'AA': 0, 'AAA': 0, 'S': 0, 'SS': 0, 'SSS': 0, 'SSS+': 0
  };

  // Base probability for player's current rank
  probabilities[playerRank] = 0.4; // 40% chance for same rank

  // Higher probability for ranks below player's rank
  for (let i = 0; i < playerRankIndex; i++) {
    const distance = playerRankIndex - i;
    probabilities[difficulties[i]] = Math.max(0.05, 0.3 / distance);
  }

  // Lower probability for ranks above player's rank
  for (let i = playerRankIndex + 1; i < difficulties.length; i++) {
    const distance = i - playerRankIndex;
    probabilities[difficulties[i]] = Math.max(0.01, 0.2 / (distance * 2));
  }

  // Normalize probabilities to sum to 1
  const total = Object.values(probabilities).reduce((sum, prob) => sum + prob, 0);
  Object.keys(probabilities).forEach(key => {
    probabilities[key as typeof difficulties[number]] /= total;
  });

  return probabilities;
}

function selectQuestDifficulty(playerLevel: number): typeof difficulties[number] {
  const playerRank = getPlayerRank(playerLevel);
  const probabilities = getQuestDifficultyProbabilities(playerRank);
  
  const random = Math.random();
  let cumulative = 0;
  
  for (const [difficulty, probability] of Object.entries(probabilities)) {
    cumulative += probability;
    if (random <= cumulative) {
      return difficulty as typeof difficulties[number];
    }
  }
  
  return playerRank; // Fallback
}

function getPhilippineDate(): string {
  const now = new Date();
  const philippineTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
  return philippineTime.toISOString().split('T')[0];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateExercises(difficulty: typeof difficulties[number]): Exercise[] {
  const multiplier = difficultyMultipliers[difficulty].exercise;
  
  // Always include walking
  const exercises: Exercise[] = [{
    id: 'walking',
    name: walkingExercise.name,
    type: walkingExercise.type,
    unit: walkingExercise.unit,
    baseAmount: Math.round(walkingExercise.baseAmount * multiplier),
    completed: false
  }];

  // Select 6 random bodyweight exercises
  const shuffledExercises = shuffleArray(bodyweightExercises);
  const selectedExercises = shuffledExercises.slice(0, 6);

  selectedExercises.forEach((exercise, index) => {
    exercises.push({
      id: `exercise_${index}`,
      name: exercise.name,
      type: exercise.type,
      unit: exercise.unit,
      baseAmount: Math.round(exercise.baseAmount * multiplier),
      completed: false
    });
  });

  return exercises;
}

export const questSystem = {
  generateDailyQuest: (playerLevel: number = 1): DailyQuest => {
    const today = getPhilippineDate();
    const difficulty = selectQuestDifficulty(playerLevel);
    
    return {
      id: `daily_${today}`,
      title: `${difficulty}-Rank Daily Challenge`,
      description: `Complete today's ${difficulty}-rank workout challenge to gain experience and improve your hunter abilities!`,
      difficulty,
      xpReward: difficultyMultipliers[difficulty].xp,
      exercises: generateExercises(difficulty),
      date: today,
      completed: false
    };
  },

  generateSpecialQuest: (): DailyQuest => {
    const today = getPhilippineDate();
    
    return {
      id: `special_${today}_${Date.now()}`,
      title: "Shadow Monarch's Trial",
      description: "A legendary SSS+ rank challenge has appeared! Complete this extreme trial to guarantee a level up. This opportunity is rare - will you accept the challenge of the Shadow Monarch?",
      difficulty: 'SSS+',
      xpReward: difficultyMultipliers['SSS+'].xp,
      exercises: generateExercises('SSS+'),
      date: today,
      completed: false,
      isSpecial: true
    };
  },

  shouldShowSpecialQuest: (): boolean => {
    // Return false during server-side rendering
    if (typeof window === 'undefined') return false;
    
    const today = getPhilippineDate();
    const lastSpecialQuest = localStorage.getItem('lastSpecialQuest');
    const specialQuestCount = parseInt(localStorage.getItem('specialQuestCount') || '0');
    
    // Reset monthly counter
    const currentMonth = new Date().getMonth();
    const lastMonth = parseInt(localStorage.getItem('lastSpecialMonth') || currentMonth.toString());
    
    if (currentMonth !== lastMonth) {
      localStorage.setItem('specialQuestCount', '0');
      localStorage.setItem('lastSpecialMonth', currentMonth.toString());
    }

    // Check if we've already shown 2 special quests this month
    if (specialQuestCount >= 2) return false;

    // Check if we've already shown a special quest today
    if (lastSpecialQuest === today) return false;

    // 2 times per month = roughly 6.67% chance per day
    const shouldShow = Math.random() < 0.067;
    
    if (shouldShow) {
      localStorage.setItem('lastSpecialQuest', today);
      localStorage.setItem('specialQuestCount', (specialQuestCount + 1).toString());
    }
    
    return shouldShow;
  },

  getDailyQuest: (playerLevel: number = 1): DailyQuest | null => {
    // Return null during server-side rendering
    if (typeof window === 'undefined') return null;
    
    const today = getPhilippineDate();
    const savedQuest = localStorage.getItem(`dailyQuest_${today}`);
    
    if (savedQuest) {
      return JSON.parse(savedQuest);
    }
    
    const newQuest = questSystem.generateDailyQuest(playerLevel);
    localStorage.setItem(`dailyQuest_${today}`, JSON.stringify(newQuest));
    return newQuest;
  },

  saveQuest: (quest: DailyQuest): void => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return;
    
    if (quest.isSpecial) {
      localStorage.setItem(`specialQuest_${quest.id}`, JSON.stringify(quest));
    } else {
      localStorage.setItem(`dailyQuest_${quest.date}`, JSON.stringify(quest));
    }
  },

  getTimeUntilMidnight: (): { hours: number; minutes: number; seconds: number } => {
    const now = new Date();
    const philippineTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
    const midnight = new Date(philippineTime);
    midnight.setHours(24, 0, 0, 0);
    
    const diff = midnight.getTime() - philippineTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  },

  getPlayerRank,
  getDifficultyColor: (difficulty: typeof difficulties[number]): string => {
    switch (difficulty) {
      case 'F': return 'bg-gray-600';
      case 'E': return 'bg-gray-500';
      case 'D': return 'bg-green-600';
      case 'C': return 'bg-green-500';
      case 'B': return 'bg-blue-600';
      case 'A': return 'bg-blue-500';
      case 'AA': return 'bg-purple-600';
      case 'AAA': return 'bg-purple-500';
      case 'S': return 'bg-yellow-600';
      case 'SS': return 'bg-orange-600';
      case 'SSS': return 'bg-red-600';
      case 'SSS+': return 'bg-gradient-to-r from-red-600 to-purple-600';
      default: return 'bg-gray-500';
    }
  }
};