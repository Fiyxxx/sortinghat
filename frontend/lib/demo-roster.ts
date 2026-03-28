export interface DemoStudent {
  name:    string;
  faculty: string;
  race:    string;
}

// 10 pre-seeded demo accounts for the live demonstration.
// Names are display-only (greeting screen) and not stored in the database.
export const DEMO_ROSTER: Record<string, DemoStudent> = {
  A0322962A: {
    name:    'Dr Eric Kerr',
    faculty: 'Faculty of Arts and Social Sciences',
    race:    'Eurasian',
  },
  A1234567A: {
    name:    'Sarah Lim',
    faculty: 'School of Computing',
    race:    'Chinese',
  },
  A0234567B: {
    name:    'Raj Kumar',
    faculty: 'Faculty of Science',
    race:    'Indian',
  },
  A0345678C: {
    name:    'Priya Nair',
    faculty: 'Yong Loo Lin School of Medicine',
    race:    'Indian',
  },
  A0456789D: {
    name:    'Wei Ming Tan',
    faculty: 'NUS Business School',
    race:    'Chinese',
  },
  A0567890E: {
    name:    'Hafiz Ahmad',
    faculty: 'College of Design and Engineering',
    race:    'Malay',
  },
  A0678901F: {
    name:    'Min Ji Park',
    faculty: 'Faculty of Arts and Social Sciences',
    race:    'Korean',
  },
  A0789012G: {
    name:    'Amelia Wong',
    faculty: 'College of Humanities and Sciences',
    race:    'Chinese',
  },
  A0890123H: {
    name:    'Darius Lee',
    faculty: 'School of Computing',
    race:    'Chinese',
  },
  A0901234J: {
    name:    'Nurul Aisyah',
    faculty: 'Faculty of Law',
    race:    'Malay',
  },
};

export const FACULTIES = [
  'College of Design and Engineering',
  'College of Humanities and Sciences',
  'Faculty of Arts and Social Sciences',
  'Faculty of Law',
  'Faculty of Science',
  'NUS Business School',
  'School of Computing',
  'Yong Loo Lin School of Medicine',
  'Yong Siew Toh Conservatory of Music',
] as const;

export const RACES = [
  'Chinese',
  'Eurasian',
  'Filipino',
  'Indian',
  'Indonesian',
  'Japanese',
  'Korean',
  'Malay',
  'Thai',
  'Vietnamese',
  'Other',
] as const;
