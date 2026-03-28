export interface FloorLayout {
  level: number;
  type: 'standard' | 'amenity';
  single: number;
  suite: number;
  accessible: number;
  total: number;
}

export interface FloorCapacity {
  total: number;
  single: number;
  suite: number;
  accessible: number;
}

export interface StudentRow {
  id: string;
  nus_id: string;
  faculty: string | null;
  race: string | null;
  extraversion: number;
  openness: number;
  agreeableness: number;
  conscientiousness: number;
  social_catalyst_score: number;
  room_type_preference: string;
  gender_floor_preference: string;
  sleep_schedule: number;
  requires_accessibility: boolean;
}

export interface LockedAssignment {
  floor:      number;
  roomType:   string;
  unitNumber?: string;
}

export interface AllocationEntry {
  run_id:              string;
  student_profile_id:  string;
  nus_id:              string;
  floor_number:        number;
  unit_number:         string;
  room_type_assigned:  string;
  placement_rationale: string;
  floor_score:         number;
  archetype:           string;
  is_locked:           boolean;
}

export interface RunSummary {
  run_id: string;
  floor_scores: Record<number, number>;
  global_fitness: number;
  duration_ms: number;
  student_count: number;
}
