'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, Trophy, Flame, Clock, Footprints, Zap } from 'lucide-react';
import { DailyQuest, Exercise, questSystem } from '@/lib/questSystem';

interface QuestModalProps {
  quest: DailyQuest;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (quest: DailyQuest) => void;
  onAcceptSpecial?: () => void;
  onDeclineSpecial?: () => void;
}

export default function QuestModal({ 
  quest, 
  isOpen, 
  onClose, 
  onComplete, 
  onAcceptSpecial, 
  onDeclineSpecial 
}: QuestModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>(quest.exercises);

  const toggleExercise = (exerciseId: string) => {
    setExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      )
    );
  };

  const completedCount = exercises.filter(ex => ex.completed).length;
  const progress = (completedCount / exercises.length) * 100;
  const allCompleted = completedCount === exercises.length;

  const handleComplete = () => {
    if (allCompleted) {
      const updatedQuest = { ...quest, exercises, completed: true };
      onComplete(updatedQuest);
      onClose();
    }
  };

  const getExerciseIcon = (exercise: Exercise) => {
    if (exercise.name === 'Walking') return <Footprints className="w-5 h-5" />;
    if (exercise.type === 'time') return <Clock className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  if (quest.isSpecial && !quest.completed && onAcceptSpecial && onDeclineSpecial) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-800 border-red-500/50 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-400 flex items-center justify-center">
              <Trophy className="w-6 h-6 mr-2" />
              Shadow Monarch's Trial!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{quest.title}</h3>
              <p className="text-gray-300 mb-4">{quest.description}</p>
              <Badge className="bg-gradient-to-r from-red-600 to-purple-600 text-white mb-4">
                SSS+ Rank - Guaranteed Level Up!
              </Badge>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={onAcceptSpecial}
                className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
              >
                Accept Challenge
              </Button>
              <Button 
                onClick={onDeclineSpecial}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Decline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-purple-500/30 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{quest.title}</span>
            <Badge className={`${questSystem.getDifficultyColor(quest.difficulty)} text-white`}>
              {quest.difficulty}-Rank
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <p className="text-gray-300 mb-4">{quest.description}</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress: {completedCount}/{exercises.length}</span>
              <span className="text-yellow-400 font-bold flex items-center">
                <Flame className="w-4 h-4 mr-1" />
                {quest.xpReward.toLocaleString()} XP
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white">Exercises to Complete:</h4>
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleExercise(exercise.id)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        {exercise.completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>
                      <div className="flex items-center space-x-2">
                        {getExerciseIcon(exercise)}
                        <div>
                          <div className={`font-medium ${exercise.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                            {exercise.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {exercise.baseAmount} {exercise.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleComplete}
              disabled={!allCompleted}
              className={`flex-1 ${
                allCompleted
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {allCompleted ? 'Complete Quest' : `Complete ${exercises.length - completedCount} more exercises`}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}