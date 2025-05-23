import { v4 as uuidv4 } from "uuid";

export interface Workout {
  id: string;
  date: Date;
  name: string;
  duration: string | null;
  description?: string;
}

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
    date: getDate(0), // Today
    name: "Morning Run",
    duration: "1:00:00",
    description: "5-mile run through the park with interval training",
  },
  {
    id: uuidv4(),
    date: getDate(0), // Today (second workout)
    name: "Evening Yoga",
    duration: "0:45:00",
    description: "Relaxing yoga session to wind down",
  },
  {
    id: uuidv4(),
    date: getDate(0), // Tomorrow
    name: "Run Training",
    duration: "0:30:00",
    description: "High-intensity interval training focusing on upper body",
  },
  {
    id: uuidv4(),
    date: getDate(0), // Tomorrow
    name: "Bike Training",
    duration: "0:30:00",
    description: "High-intensity interval training focusing on upper body",
  },
  {
    id: uuidv4(),
    date: getDate(0), // Tomorrow
    name: "Swim Training",
    duration: "0:30:00",
    description: "High-intensity interval training focusing on upper body",
  },
  {
    id: uuidv4(),
    date: getDate(2),
    name: "Swimming",
    duration: "0:45:00",
    description: "Lap swimming at the community pool",
  },
  {
    id: uuidv4(),
    date: getDate(3),
    name: "Rock Climbing",
    duration: "1:30:00",
    description: "Bouldering session at the climbing gym",
  },
  {
    id: uuidv4(),
    date: getDate(4),
    name: "Rest Day",
    duration: null,
    description: "Active recovery - light stretching and walking",
  },
  {
    id: uuidv4(),
    date: getDate(5),
    name: "Long Run",
    duration: "1:30:00",
    description: "10-mile endurance run",
  },

  // Next week
  {
    id: uuidv4(),
    date: getDate(7),
    name: "Cycling",
    duration: "2:00:00",
    description: "30-mile bike ride on scenic route",
  },
  {
    id: uuidv4(),
    date: getDate(8),
    name: "Strength Training",
    duration: "1:00:00",
    description: "Focus on lower body and core",
  },
  {
    id: uuidv4(),
    date: getDate(9),
    name: "Kickboxing",
    duration: "1:00:00",
    description: "Group class at the fitness center",
  },
  {
    id: uuidv4(),
    date: getDate(10),
    name: "Yoga",
    duration: "0:45:00",
    description: "Morning yoga and meditation",
  },
  {
    id: uuidv4(),
    date: getDate(11),
    name: "Sprint Training",
    duration: "0:30:00",
    description: "Track workout - 400m repeats",
  },
  {
    id: uuidv4(),
    date: getDate(12),
    name: "Hiking",
    duration: "3:00:00",
    description: "Mountain trail with moderate elevation gain",
  },

  // Previous week
  {
    id: uuidv4(),
    date: getDate(-7),
    name: "Rowing",
    duration: "0:45:00",
    description: "Indoor rowing machine workout",
  },
  {
    id: uuidv4(),
    date: getDate(-6),
    name: "CrossFit",
    duration: "1:00:00",
    description: "WOD at local CrossFit box",
  },
  {
    id: uuidv4(),
    date: getDate(-5),
    name: "Tennis",
    duration: "1:30:00",
    description: "Doubles match with friends",
  },
  {
    id: uuidv4(),
    date: getDate(-4),
    name: "Rest Day",
    duration: null,
    description: "Complete rest - focus on recovery",
  },
  {
    id: uuidv4(),
    date: getDate(-3),
    name: "Weight Training",
    duration: "1:15:00",
    description: "Upper body focus - chest and back",
  },
  {
    id: uuidv4(),
    date: getDate(-2),
    name: "Pilates",
    duration: "0:45:00",
    description: "Core strengthening and flexibility",
  },
  {
    id: uuidv4(),
    date: getDate(-1),
    name: "Easy Run",
    duration: "0:45:00",
    description: "Recovery run at conversational pace",
  },
];
