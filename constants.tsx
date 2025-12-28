
import React from 'react';
import { Award, Flame, Target, Moon, Sun, Trophy } from 'lucide-react';
import { Workout } from './types';

export const INITIAL_WORKOUTS: Record<string, Workout> = {
  'Strength': {
    id: 'w_strength',
    title: 'Neural Strength Matrix',
    type: 'Strength',
    difficulty: 'Challenging',
    estimatedTime: 35,
    explanation: "Optimized for myofibrillar hypertrophy. Your current recovery node suggests high CNS readiness.",
    neuralInsight: "You are the architect of your own vessel. Every rep is a blueprint for a stronger tomorrow.",
    tags: ['Hypertrophy', 'Neural Drive'],
    exercises: [
      { id: 's1', name: 'Goblet Squats', reps: '4 Sets of 12', instructions: 'Deep depth, core locked.', muscles: ['Quads', 'Core'] },
      { id: 's2', name: 'Diamond Push-ups', reps: '3 Sets of 15', instructions: 'Elbows tight to ribs.', muscles: ['Triceps', 'Chest'] },
      { id: 's3', name: 'Renegade Rows', reps: '3 Sets of 10/side', instructions: 'Zero hip rotation.', muscles: ['Back', 'Core'] }
    ]
  },
  'Cardio': {
    id: 'w_cardio',
    title: 'Vascular Flow Protocol',
    type: 'Cardio',
    difficulty: 'High Intensity',
    estimatedTime: 20,
    explanation: "Focused on VO2 Max optimization. We've adjusted intervals to match your morning heart rate variability.",
    neuralInsight: "Movement is the rhythm of life. Today, we synchronize your pulse with your potential.",
    tags: ['HIIT', 'Endurance'],
    exercises: [
      { id: 'c1', name: 'Mountain Climbers', duration: 45, instructions: 'Rapid pace, flat back.', muscles: ['Full Body', 'Heart'] },
      { id: 'c2', name: 'Burpee Transitions', duration: 30, instructions: 'Explosive jump, soft landing.', muscles: ['Full Body'] },
      { id: 'c3', name: 'High Knees', duration: 60, instructions: 'Knees to hip level, fast arms.', muscles: ['Legs', 'Heart'] }
    ]
  },
  'Flexibility': {
    id: 'w_flex',
    title: 'Kinetic Mobility Reset',
    type: 'Flexibility',
    difficulty: 'Calm',
    estimatedTime: 15,
    explanation: "Restoring joint workspace. Intelligence requires a supple frame to manifest power.",
    neuralInsight: "Bending without breaking is the ultimate form of resilience.",
    tags: ['Mobility', 'Recovery'],
    exercises: [
      { id: 'f1', name: 'Worlds Greatest Stretch', reps: '5 per side', instructions: 'Full thoracic rotation.', muscles: ['Hips', 'Spine'] },
      { id: 'f2', name: '90/90 Hip Transitions', duration: 120, instructions: 'Controlled internal rotation.', muscles: ['Hips'] },
      { id: 'f3', name: 'Cat-Cow Neural Glide', duration: 60, instructions: 'Vertebra by vertebra.', muscles: ['Spine'] }
    ]
  }
};

export const BADGE_ICONS: Record<string, React.ReactNode> = {
  'First Workout': <Award className="w-8 h-8 text-cyan-400" />,
  '3-Day Streak': <Flame className="w-8 h-8 text-orange-400" />,
  'Perfect Form': <Target className="w-8 h-8 text-green-400" />,
  'Night Owl': <Moon className="w-8 h-8 text-purple-400" />,
  'Early Bird': <Sun className="w-8 h-8 text-yellow-400" />,
  'Consistency Master': <Trophy className="w-8 h-8 text-pink-400" />
};
