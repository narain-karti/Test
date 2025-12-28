
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type FitnessGoal = 'strength' | 'cardio' | 'flexibility' | 'weight-loss';
export type WorkoutType = 'Strength' | 'Cardio' | 'Flexibility' | 'Recovery';

export interface UserProfile {
  name: string;
  level: FitnessLevel;
  goal: FitnessGoal;
  equipment: string[];
  fatigueLevel: number; // 1-10
  streak: number;
}

export interface WorkoutStep {
  id: string;
  name: string;
  reps?: string;
  duration?: number; // seconds
  instructions: string;
  muscles: string[];
}

export interface Workout {
  id: string;
  title: string;
  type: WorkoutType;
  difficulty: string;
  estimatedTime: number;
  explanation: string;
  exercises: WorkoutStep[];
  tags: string[];
  neuralInsight?: string; // Psychological hook
}

export interface MediaItem {
  type: 'image' | 'video' | 'audio';
  data: string; // base64
  mimeType: string;
  previewUrl?: string;
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface BotMessage {
  role: 'user' | 'assistant';
  content: string;
  media?: MediaItem[];
  thinking?: string;
  urls?: GroundingLink[];
  isAudioPlaying?: boolean;
}

export type BotMode = 'standard' | 'lite' | 'thinking' | 'search' | 'maps';

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
