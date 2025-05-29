import { v4 as uuidv4 } from "uuid";

export interface Workout {
  id: string;
  date: Date;
  name: string;
  duration: string | null;
  type: WorkoutType;
  description?: string;
}

export type WorkoutType =
  | "run"
  | "swim"
  | "bike"
  | "yoga"
  | "strength"
  | "other"
  | "rest";

export const WorkoutType = {
  RUN: "run" as WorkoutType,
  SWIM: "swim" as WorkoutType,
  BIKE: "bike" as WorkoutType,
  YOGA: "yoga" as WorkoutType,
  STRENGTH: "strength" as WorkoutType,
  OTHER: "other" as WorkoutType,
  REST: "rest" as WorkoutType,
};

// Helper function to generate dates relative to today
const getDate = (offset: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
};

export const workouts: Workout[] = [
  // This week
  {
    id: uuidv4(),
    date: getDate(-4), // Today
    name: "Morning Run",
    duration: "1:00:00",
    type: WorkoutType.RUN,
    description: "5-mile run through the park with interval training",
  },
  {
    id: uuidv4(),
    date: getDate(-4), // Today (second workout)
    name: "Evening Yoga",
    duration: "0:45:00",
    type: WorkoutType.YOGA,
    description: "Relaxing yoga session to wind down",
  },
  {
    id: uuidv4(),
    date: getDate(-4), // Tomorrow
    name: "Run Training",
    duration: "0:30:00",
    type: WorkoutType.RUN,
    description: "High-intensity interval training focusing on upper body",
  },
  {
    id: uuidv4(),
    date: getDate(-4), // Tomorrow
    name: "Bike Training",
    duration: "0:30:00",
    type: WorkoutType.BIKE,
    description: "High-intensity interval training focusing on upper body",
  },
  {
    id: uuidv4(),
    date: getDate(0), // Tomorrow
    name: "Swim Training",
    duration: "0:30:00",
    type: WorkoutType.SWIM,
    description: "High-intensity interval training focusing on upper body",
  },
  {
    id: uuidv4(),
    date: getDate(2),
    name: "Swimming",
    duration: "0:45:00",
    type: WorkoutType.SWIM,
    description: "Lap swimming at the community pool",
  },
  {
    id: uuidv4(),
    date: getDate(3),
    name: "Rock Climbing",
    duration: "1:30:00",
    type: WorkoutType.OTHER,
    description: "Bouldering session at the climbing gym",
  },
  {
    id: uuidv4(),
    date: getDate(4),
    name: "Rest Day",
    duration: null,
    type: WorkoutType.REST,
    description: "Active recovery - light stretching and walking",
  },
  {
    id: uuidv4(),
    date: getDate(5),
    name: "Long Run",
    duration: "1:30:00",
    type: WorkoutType.RUN,
    description: "10-mile endurance run",
  },

  // Next week
  {
    id: uuidv4(),
    date: getDate(7),
    name: "Cycling",
    duration: "2:00:00",
    type: WorkoutType.BIKE,
    description: "30-mile bike ride on scenic route",
  },
  {
    id: uuidv4(),
    date: getDate(8),
    name: "Strength Training",
    duration: "1:00:00",
    type: WorkoutType.STRENGTH,
    description: "Focus on lower body and core",
  },
  {
    id: uuidv4(),
    date: getDate(9),
    name: "Kickboxing",
    duration: "1:00:00",
    type: WorkoutType.OTHER,
    description: "Group class at the fitness center",
  },
  {
    id: uuidv4(),
    date: getDate(10),
    name: "Yoga",
    duration: "0:45:00",
    type: WorkoutType.YOGA,
    description: "Morning yoga and meditation",
  },
  {
    id: uuidv4(),
    date: getDate(11),
    name: "Sprint Training",
    duration: "0:30:00",
    type: WorkoutType.RUN,
    description: "Track workout - 400m repeats",
  },
  {
    id: uuidv4(),
    date: getDate(12),
    name: "Hiking",
    duration: "3:00:00",
    type: WorkoutType.OTHER,
    description: "Mountain trail with moderate elevation gain",
  },

  // Previous week
  {
    id: uuidv4(),
    date: getDate(-7),
    name: "Rowing",
    duration: "0:45:00",
    type: WorkoutType.OTHER,
    description: "Indoor rowing machine workout",
  },
  {
    id: uuidv4(),
    date: getDate(-6),
    name: "CrossFit",
    duration: "1:00:00",
    type: WorkoutType.OTHER,
    description: "WOD at local CrossFit box",
  },
  {
    id: uuidv4(),
    date: getDate(-5),
    name: "Tennis",
    duration: "1:30:00",
    type: WorkoutType.OTHER,
    description: "Doubles match with friends",
  },
  {
    id: uuidv4(),
    date: getDate(6),
    name: "Rest Day",
    duration: null,
    type: WorkoutType.REST,
    description: "Complete rest - focus on recovery",
  },
  {
    id: uuidv4(),
    date: getDate(-3),
    name: "Weight Training",
    duration: "1:15:00",
    type: WorkoutType.STRENGTH,
    description: "Upper body focus - chest and back",
  },
  {
    id: uuidv4(),
    date: getDate(-2),
    name: "Pilates",
    duration: "0:45:00",
    type: WorkoutType.YOGA,
    description: "Core strengthening and flexibility",
  },
  {
    id: uuidv4(),
    date: getDate(-1),
    name: "Easy Run",
    duration: "0:45:00",
    type: WorkoutType.RUN,
    description: "Recovery run at conversational pace",
  },
];

export const fitFileData = {
  protocolVersion: 16,
  profileVersion: 2096,
  file_creator: {
    software_version: 807,
  },
  user_profile: {
    friendly_name: "Mitchell Sides",
    gender: "male",
    weight: 85.3,
    weight_setting: "metric",
  },
  activity: {
    timestamp: "2025-05-23T00:37:06.000Z",
    total_timer_time: 3695,
    num_sessions: 1,
    type: "manual",
    event: "activity",
    event_type: "stop",
    sessions: [
      {
        timestamp: "2025-05-23T00:37:06.000Z",
        event: "session",
        event_type: "stop",
        start_time: "2025-05-22T23:34:09.000Z",
        sport: "cycling",
        sub_sport: "generic",
        total_elapsed_time: 3776,
        total_timer_time: 3695,
        total_distance: 30.0111,
        first_lap_index: 0,
        num_laps: 7,
        trigger: "activity_end",
        laps: [
          {
            message_index: {
              "0": false,
              value: 2,
              reserved: false,
              selected: false,
            },
            lap_trigger: "manual",
            event: "lap",
            event_type: "stop",
            sport: "cycling",
            timestamp: "2025-05-22T23:59:50.000Z",
            start_time: "2025-05-22T23:54:51.000Z",
            total_elapsed_time: 299,
            total_timer_time: 299,
            start_position_lat: 30.151072964072227,
            start_position_long: -95.52494295872748,
            end_position_lat: 30.143222976475954,
            end_position_long: -95.51564399152994,
            total_distance: 2.1525,
            records: [
              {
                timestamp: "2025-05-22T23:54:51.000Z",
                elapsed_time: 1242,
                timer_time: 1242,
                position_lat: 30.151072964072227,
                position_long: -95.52494295872748,
                altitude: 0.048600000000000025,
                distance: 9.617790000000001,
                speed: 35.28,
                cadence: 77,
                temperature: -239.14999999999998,
                power: 176,
              },
              {
                timestamp: "2025-05-22T23:54:52.000Z",
                elapsed_time: 1243,
                timer_time: 1243,
                position_lat: 30.151028959080577,
                position_long: -95.52485696040094,
                altitude: 0.048799999999999955,
                distance: 9.6274,
                speed: 35.136,
                cadence: 75,
                temperature: -239.14999999999998,
                power: 43,
              },
            ],
            lengths: [],
          },
          {
            message_index: {
              "0": false,
              value: 3,
              reserved: false,
              selected: false,
            },
            lap_trigger: "manual",
            event: "lap",
            event_type: "stop",
            sport: "cycling",
            timestamp: "2025-05-23T00:09:50.000Z",
            start_time: "2025-05-22T23:59:51.000Z",
            total_elapsed_time: 599,
            total_timer_time: 599,
            start_position_lat: 30.143271926790476,
            start_position_long: -95.5157149862498,
            end_position_lat: 30.151483928784728,
            end_position_long: -95.52589799277484,
            total_distance: 5.76879,
            records: [
              {
                timestamp: "2025-05-22T23:59:51.000Z",
                elapsed_time: 1542,
                timer_time: 1542,
                position_lat: 30.143271926790476,
                position_long: -95.5157149862498,
                altitude: 0.04460000000000002,
                distance: 11.779,
                speed: 30.888,
                cadence: 81,
                temperature: -240.14999999999998,
                power: 229,
              },
              {
                timestamp: "2025-05-22T23:59:52.000Z",
                elapsed_time: 1543,
                timer_time: 1543,
                position_lat: 30.14332498423755,
                position_long: -95.51578497514129,
                altitude: 0.04460000000000002,
                distance: 11.7879,
                speed: 31.176000000000002,
                cadence: 80,
                temperature: -240.14999999999998,
                power: 271,
              },
            ],
            lengths: [],
          },
        ],
      },
    ],
    events: [
      {
        event: "timer",
        event_type: "start",
        event_group: 0,
        timestamp: "2025-05-22T23:34:09.000Z",
        data: 0,
      },
      {
        event: "timer",
        event_type: "stop_all",
        event_group: 0,
        timestamp: "2025-05-23T00:37:06.000Z",
        data: 0,
      },
    ],
    hrv: [],
    device_infos: [],
    developer_data_ids: [],
    field_descriptions: [],
    sports: [],
  },
};
