export interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  xpToNext: number;
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
  };
  achievements: string[];
  completedQuests: string[];
  rank: number;
  joinDate: string;
  lastActive: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Mock database - in production, this would be a real database
let users: User[] = [
  {
    id: '1',
    username: 'ShadowMonarch',
    email: 'shadow@example.com',
    level: 42,
    xp: 8750,
    xpToNext: 10000,
    stats: {
      strength: 156,
      agility: 134,
      intelligence: 98,
      vitality: 142
    },
    achievements: ['first_quest', 'level_10', 'hundred_kills'],
    completedQuests: ['shadow_training', 'daily_dungeon'],
    rank: 1,
    joinDate: '2024-01-15',
    lastActive: new Date().toISOString()
  },
  {
    id: '2',
    username: 'IronBlade',
    email: 'iron@example.com',
    level: 38,
    xp: 7200,
    xpToNext: 9500,
    stats: {
      strength: 142,
      agility: 118,
      intelligence: 85,
      vitality: 128
    },
    achievements: ['first_quest', 'level_10'],
    completedQuests: ['strength_trial'],
    rank: 2,
    joinDate: '2024-01-20',
    lastActive: '2024-12-20T10:30:00Z'
  },
  {
    id: '3',
    username: 'StormWalker',
    email: 'storm@example.com',
    level: 35,
    xp: 6800,
    xpToNext: 8750,
    stats: {
      strength: 125,
      agility: 145,
      intelligence: 92,
      vitality: 115
    },
    achievements: ['first_quest', 'level_10'],
    completedQuests: ['daily_dungeon'],
    rank: 3,
    joinDate: '2024-02-01',
    lastActive: '2024-12-19T15:45:00Z'
  },
  {
    id: '4',
    username: 'FireSage',
    email: 'fire@example.com',
    level: 33,
    xp: 6100,
    xpToNext: 8250,
    stats: {
      strength: 108,
      agility: 112,
      intelligence: 138,
      vitality: 122
    },
    achievements: ['first_quest'],
    completedQuests: [],
    rank: 4,
    joinDate: '2024-02-10',
    lastActive: '2024-12-18T09:20:00Z'
  },
  {
    id: '5',
    username: 'VoidHunter',
    email: 'void@example.com',
    level: 31,
    xp: 5500,
    xpToNext: 7750,
    stats: {
      strength: 118,
      agility: 125,
      intelligence: 95,
      vitality: 108
    },
    achievements: ['first_quest'],
    completedQuests: [],
    rank: 5,
    joinDate: '2024-02-15',
    lastActive: '2024-12-17T14:10:00Z'
  }
];

// Mock passwords - in production, these would be hashed
const passwords: Record<string, string> = {
  'ShadowMonarch': 'password123',
  'IronBlade': 'blade456',
  'StormWalker': 'storm789',
  'FireSage': 'fire321',
  'VoidHunter': 'void654'
};

export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = users.find(u => u.username === username);
    if (user && passwords[username] === password) {
      // Update last active
      user.lastActive = new Date().toISOString();
      return user;
    }
    return null;
  },

  register: async (username: string, email: string, password: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if username or email already exists
    if (users.some(u => u.username === username || u.email === email)) {
      return null;
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      username,
      email,
      level: 1,
      xp: 0,
      xpToNext: 1000,
      stats: {
        strength: 10,
        agility: 10,
        intelligence: 10,
        vitality: 10
      },
      achievements: [],
      completedQuests: [],
      rank: users.length + 1,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString()
    };

    users.push(newUser);
    passwords[username] = password;
    
    // Recalculate ranks
    updateRanks();
    
    return newUser;
  },

  getAllUsers: (): User[] => {
    return [...users].sort((a, b) => {
      if (a.level !== b.level) return b.level - a.level;
      return b.xp - a.xp;
    });
  },

  updateUser: (updatedUser: User): void => {
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = { ...updatedUser, lastActive: new Date().toISOString() };
      updateRanks();
    }
  },

  getUserById: (id: string): User | null => {
    return users.find(u => u.id === id) || null;
  }
};

function updateRanks(): void {
  const sortedUsers = [...users].sort((a, b) => {
    if (a.level !== b.level) return b.level - a.level;
    return b.xp - a.xp;
  });

  sortedUsers.forEach((user, index) => {
    user.rank = index + 1;
  });
}