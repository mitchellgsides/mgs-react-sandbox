export interface Workout {
  id: number;
  name: string;
  duration: string | null;
  description?: string;
}

export const workouts = [
  {
    id: 0,
    date: new Date(),
    name: "Run",
    duration: "1:00:00",
    description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, a accusantium! Adipisci, enim? Ipsum laboriosam aliquam velit totam ullam explicabo rerum? Voluptatem quasi dolore voluptates est iure eius impedit deserunt?`,
  },
  { id: 1, name: "Swim", duration: null, description: "Evening swim" },
];
