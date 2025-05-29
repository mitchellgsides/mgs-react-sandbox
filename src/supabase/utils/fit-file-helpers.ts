// convert type to one of my workout types

import { WorkoutType } from "../../pages/Calendar/context/fakeData";

export const convertFitTypeToWorkoutType = (fitType: string): WorkoutType => {
  if (fitType === "cycling") {
    return WorkoutType.BIKE;
  } else {
    return (
      WorkoutType[fitType.toUpperCase() as keyof typeof WorkoutType] ||
      WorkoutType.OTHER
    );
  }
};
