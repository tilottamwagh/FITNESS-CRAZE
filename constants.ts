
import { User, Role, FitnessData, MonthlyData } from './types';

export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const createEmptyMonthlyData = (): MonthlyData => ({
  date: '', treadmill: '', chestPress: '', latPulldown: '', squatLegPress: '', sitAndReach: '',
  neck: '', chest: '', abs: '', hips: '', thighs: '', midArms: '', weight: '',
  bmi: '', muscleMass: '', fatMass: '', fatPercentage: '', bmr: '', visceralFatLevel: ''
});

export const createEmptyFitnessData = (): FitnessData => {
  return MONTHS.reduce((acc, month) => {
    acc[month] = createEmptyMonthlyData();
    return acc;
  }, {} as FitnessData);
};

// NOTE: MOCK_USERS are no longer used by the application but are kept for potential testing and to avoid breaking imports.
export const MOCK_USERS: User[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    name: 'Admin',
    mobile: 'N/A',
    membershipDetails: 'N/A',
    email: 'admin@example.com',
    role: Role.Admin,
    fitnessData: createEmptyFitnessData(),
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    name: 'John Doe',
    mobile: '123-456-7890',
    membershipDetails: 'Gold Member',
    email: 'john@example.com',
    role: Role.User,
    fitnessData: {
      ...createEmptyFitnessData(),
      JAN: {
        date: '15', treadmill: '30 min', chestPress: '50 kg', latPulldown: '40 kg', squatLegPress: '100 kg', sitAndReach: '25 cm',
        neck: '15"', chest: '40"', abs: '32"', hips: '38"', thighs: '22"', midArms: '14"', weight: '80 kg',
        bmi: '24.9', muscleMass: '60 kg', fatMass: '15 kg', fatPercentage: '18.75%', bmr: '1800', visceralFatLevel: '5'
      },
      FEB: {
        date: '14', treadmill: '35 min', chestPress: '55 kg', latPulldown: '45 kg', squatLegPress: '105 kg', sitAndReach: '26 cm',
        neck: '15"', chest: '40.5"', abs: '31.5"', hips: '38"', thighs: '22.5"', midArms: '14.2"', weight: '79 kg',
        bmi: '24.6', muscleMass: '60.5 kg', fatMass: '14 kg', fatPercentage: '17.72%', bmr: '1780', visceralFatLevel: '4'
      }
    },
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef2',
    name: 'Jane Smith',
    mobile: '098-765-4321',
    membershipDetails: 'Silver Member',
    email: 'jane@example.com',
    role: Role.User,
    fitnessData: createEmptyFitnessData(),
  },
];

export const TEST_FIELDS: (keyof MonthlyData)[] = ['treadmill', 'chestPress', 'latPulldown', 'squatLegPress', 'sitAndReach'];
export const MEASUREMENT_FIELDS: (keyof MonthlyData)[] = ['neck', 'chest', 'abs', 'hips', 'thighs', 'midArms', 'weight'];
export const OTHER_FIELDS: (keyof MonthlyData)[] = ['bmi', 'muscleMass', 'fatMass', 'fatPercentage', 'bmr', 'visceralFatLevel'];

export const FIELD_LABELS: Record<keyof MonthlyData, string> = {
    date: 'Date',
    treadmill: 'Treadmill',
    chestPress: 'Chest Press',
    latPulldown: 'Lat Pul Down',
    squatLegPress: 'Squat / Leg Press',
    sitAndReach: 'Sit & Reach',
    neck: 'Neck',
    chest: 'Chest',
    abs: 'Abs',
    hips: 'Hips',
    thighs: 'Thighs',
    midArms: 'Mid Arms',
    weight: 'WT',
    bmi: 'BMI',
    muscleMass: 'Muscle Mass',
    fatMass: 'Fat Mass',
    fatPercentage: 'Fat %',
    bmr: 'BMR',
    visceralFatLevel: 'Visceral Fat Level'
};