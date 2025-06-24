'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sword,
  Shield,
  Zap,
  Trophy,
  Target,
  Star,
  Flame,
  Crown,
  TrendingUp,
  LogOut,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import LoginForm from '@/components/LoginForm';
import QuestModal from '@/components/QuestModal';
import { authService, User } from '@/lib/auth';
import { questSystem, DailyQuest } from '@/lib/questSystem';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dailyQuest, setDailyQuest] = useState<DailyQuest | null>(null);
  const [specialQuest, setSpecialQuest] = useState<DailyQuest | null>(null);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [currentQuestInModal, setCurrentQuestInModal] = useState<DailyQuest | null>(null);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const [achievements] = useState<Achievement[]>([
    {
      id: 'first_quest',
      title: 'First Steps',
      description: 'Complete your first quest',
      icon: '🎯',
      unlocked: false
    },
    {
      id: 'level_10',
      title: 'Rising Hunter',
      description: 'Reach level 10',
      icon: '⭐',
      unlocked: false
    },
    {
      id: 'hundred_kills',
      title: 'Monster Slayer',
      description: 'Defeat 100 monsters',
      icon: '⚔️',
      unlocked: false
    },
    {
      id: 'level_50',
      title: 'Elite Hunter',
      description: 'Reach level 50',
      icon: '👑',
      unlocked: false
    },
    {
      id: 'special_quest',
      title: 'Shadow Monarch',
      description: 'Complete a Shadow Monarch trial',
      icon: '🔥',
      unlocked: false
    }
  ]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setAllUsers(authService.getAllUsers());
      loadDailyQuest();
      checkForSpecialQuest();
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilMidnight(questSystem.getTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadDailyQuest = () => {
    if (currentUser) {
      const quest = questSystem.getDailyQuest(currentUser.level);
      setDailyQuest(quest);
    }
  };

  const checkForSpecialQuest = () => {
    if (questSystem.shouldShowSpecialQuest()) {
      const special = questSystem.generateSpecialQuest();
      setSpecialQuest(special);
      setCurrentQuestInModal(special);
      setIsQuestModalOpen(true);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAllUsers(authService.getAllUsers());
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAllUsers([]);
    setDailyQuest(null);
    setSpecialQuest(null);
  };

  const handleQuestClick = (quest: DailyQuest) => {
    setCurrentQuestInModal(quest);
    setIsQuestModalOpen(true);
  };

  const handleQuestComplete = (completedQuest: DailyQuest) => {
    if (!currentUser) return;

    let xpGained = completedQuest.xpReward;
    let guaranteedLevelUp = false;

    // Special quest guarantees level up
    if (completedQuest.isSpecial) {
      guaranteedLevelUp = true;
      // Calculate XP needed to level up
      const xpNeeded = currentUser.xpToNext - currentUser.xp;
      if (xpGained < xpNeeded) {
        xpGained = xpNeeded;
      }
    }

    const newXp = currentUser.xp + xpGained;
    let newLevel = currentUser.level;
    let newXpToNext = currentUser.xpToNext;

    // Level up logic
    while (newXp >= newXpToNext || guaranteedLevelUp) {
      newLevel += 1;
      newXpToNext = newLevel * 1000;
      guaranteedLevelUp = false; // Only guarantee one level up
    }

    const statsIncrease = newLevel - currentUser.level;
    const updatedUser: User = {
      ...currentUser,
      xp: newXp,
      level: newLevel,
      xpToNext: newXpToNext,
      completedQuests: [...currentUser.completedQuests, completedQuest.id],
      stats: {
        strength: currentUser.stats.strength + statsIncrease * 2,
        agility: currentUser.stats.agility + statsIncrease * 2,
        intelligence: currentUser.stats.intelligence + statsIncrease * 2,
        vitality: currentUser.stats.vitality + statsIncrease * 2
      }
    };

    setCurrentUser(updatedUser);
    authService.updateUser(updatedUser);
    setAllUsers(authService.getAllUsers());

    // Update quest status
    if (completedQuest.isSpecial) {
      setSpecialQuest({ ...completedQuest, completed: true });
    } else {
      setDailyQuest({ ...completedQuest, completed: true });
      questSystem.saveQuest({ ...completedQuest, completed: true });
    }
  };

  const handleAcceptSpecialQuest = () => {
    setIsQuestModalOpen(false);
    // Keep the special quest available for completion
  };

  const handleDeclineSpecialQuest = () => {
    setSpecialQuest(null);
    setIsQuestModalOpen(false);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPlayerRankBadge = (level: number) => {
    const rank = questSystem.getPlayerRank(level);
    const colorClass = questSystem.getDifficultyColor(rank);
    return (
      <Badge className={`${colorClass} text-white font-bold`}>
        {rank}-Rank Hunter
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const xpProgress = currentUser ? (currentUser.xp / currentUser.xpToNext) * 100 : 0;

  const updatedAchievements = achievements.map(achievement => ({
    ...achievement,
    unlocked:
      currentUser?.achievements.includes(achievement.id) ||
      (achievement.id === 'level_10' && currentUser && currentUser.level >= 10) ||
      (achievement.id === 'level_50' && currentUser && currentUser.level >= 50) ||
      (achievement.id === 'first_quest' && currentUser && currentUser.completedQuests.length > 0) ||
      (achievement.id === 'special_quest' && specialQuest?.completed)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Hunter&apos;s Guild</h1>
              <p className="text-gray-400">Welcome back, {currentUser?.username}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-purple-500/30 text-white hover:bg-purple-600/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Player Stats Card */}
        <Card className="mb-8 bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              Hunter Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Level {currentUser?.level}</span>
                    <span className="text-yellow-400 font-bold">
                      {currentUser?.xp.toLocaleString()} / {currentUser?.xpToNext.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress value={xpProgress} className="h-3" />
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">
                    Joined: {currentUser && formatDate(currentUser.joinDate)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <Sword className="w-6 h-6 mx-auto mb-1 text-red-400" />
                  <div className="text-white font-bold">{currentUser?.stats.strength}</div>
                  <div className="text-xs text-gray-400">Strength</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
                  <div className="text-white font-bold">{currentUser?.stats.agility}</div>
                  <div className="text-xs text-gray-400">Agility</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <Star className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                  <div className="text-white font-bold">{currentUser?.stats.intelligence}</div>
                  <div className="text-xs text-gray-400">Intelligence</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-green-400" />
                  <div className="text-white font-bold">{currentUser?.stats.vitality}</div>
                  <div className="text-xs text-gray-400">Vitality</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Quests Completed:</span>
                  <span className="text-white font-bold">{currentUser?.completedQuests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Achievements:</span>
                  <span className="text-white font-bold">
                    {updatedAchievements.filter(a => a.unlocked).length}/{achievements.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Rank:</span>
                  {currentUser && getPlayerRankBadge(currentUser.level)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="quests" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-purple-500/30">
            <TabsTrigger value="quests" className="data-[state=active]:bg-purple-600">
              <Target className="w-4 h-4 mr-2" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Daily Quest</h2>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  Resets in {timeUntilMidnight.hours}h {timeUntilMidnight.minutes}m {timeUntilMidnight.seconds}s
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Daily Quest */}
              {dailyQuest && (
                <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">{dailyQuest.title}</CardTitle>
                      <Badge className={`${questSystem.getDifficultyColor(dailyQuest.difficulty)} text-white`}>
                        {dailyQuest.difficulty}-Rank
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{dailyQuest.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 font-bold">
                        <Flame className="w-4 h-4 inline mr-1" />
                        {dailyQuest.xpReward.toLocaleString()} XP
                      </span>
                      <Button
                        onClick={() => handleQuestClick(dailyQuest)}
                        disabled={dailyQuest.completed}
                        className={
                          dailyQuest.completed
                            ? 'bg-green-600 hover:bg-green-600'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        }
                      >
                        {dailyQuest.completed ? 'Completed' : 'Start Quest'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Special Quest */}
              {specialQuest && !specialQuest.completed && (
                <Card className="bg-gradient-to-r from-red-900/50 to-purple-900/50 border-red-500/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-red-400 flex items-center">
                        <Flame className="w-5 h-5 mr-2" />
                        {specialQuest.title}
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-red-600 to-purple-600 text-white">
                        SSS+ Special Quest
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-2">{specialQuest.description}</p>
                    <p className="text-red-400 font-semibold mb-4">⚡ Guaranteed Level Up!</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 font-bold">
                        <Flame className="w-4 h-4 inline mr-1" />
                        {specialQuest.xpReward.toLocaleString()} XP
                      </span>
                      <Button
                        onClick={() => handleQuestClick(specialQuest)}
                        className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
                      >
                        Accept Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {updatedAchievements.map((achievement) => (
                <Card key={achievement.id} className={`bg-slate-800/50 border-purple-500/30 backdrop-blur-sm ${
                  achievement.unlocked ? 'ring-2 ring-yellow-400/50' : 'opacity-60'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="text-white font-bold mb-2">{achievement.title}</h3>
                    <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                    <Badge className={achievement.unlocked ? 'bg-yellow-500' : 'bg-gray-600'}>
                      {achievement.unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Guild Leaderboard</h2>
            <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {allUsers
                    .sort((a, b) => b.level - a.level || b.xp - a.xp)
                    .map((user, index) => (
                      <div key={user.id} className={`flex items-center justify-between p-4 rounded-lg ${
                        user.id === currentUser?.id ? 'bg-purple-600/20 border border-purple-500/30' : 'bg-slate-700/30'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-amber-600 text-black' :
                            'bg-slate-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-semibold">{user.username}</span>
                              {user.id === currentUser?.id && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>Level {user.level}</span>
                              <span>{user.xp.toLocaleString()} XP</span>
                              <span>{user.completedQuests.length} quests</span>
                              {getPlayerRankBadge(user.level)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-gray-400 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{formatLastActive(user.lastActive)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quest Modal */}
      {currentQuestInModal && (
        <QuestModal
          quest={currentQuestInModal}
          isOpen={isQuestModalOpen}
          onClose={() => setIsQuestModalOpen(false)}
          onComplete={handleQuestComplete}
          onAcceptSpecial={handleAcceptSpecialQuest}
          onDeclineSpecial={handleDeclineSpecialQuest}
        />
      )}
    </div>
  );
}