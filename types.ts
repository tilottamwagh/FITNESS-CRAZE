export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
}

export interface MonthlyData {
  date: string;
  treadmill: string;
  chestPress: string;
  latPulldown: string;
  squatLegPress: string;
  sitAndReach: string;
  neck: string;
  chest: string;
  abs: string;
  hips: string;
  thighs: string;
  midArms: string;
  weight: string;
  bmi: string;
  muscleMass: string;
  fatMass: string;
  fatPercentage: string;
  bmr: string;
  visceralFatLevel: string;
}

export type FitnessData = {
  [month: string]: MonthlyData;
};

export interface User {
  id: string; // Changed to string for Supabase UUID
  name: string;
  mobile: string;
  membershipDetails: string;
  email: string; // Changed from username
  role: Role;
  fitnessData: FitnessData | null;
}
