export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Meal {
  id: string;
  userId: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  date: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  exercises: Exercise[];
  date: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Set {
  reps: number;
  weight: number;
}

export interface WaterLog {
  id: string;
  userId: string;
  amount: number; // in ml
  date: string;
}

export interface StepLog {
  id: string;
  userId: string;
  steps: number;
  date: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  weight: number;
  date: string;
}