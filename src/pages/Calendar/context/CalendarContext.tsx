import { addWeeks, startOfWeek, subWeeks } from "date-fns";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { MAX_WEEKS, WEEKS_TO_LOAD } from "../CalendarPage";
import { type Workout } from "./fakeData";
import {
  fetchActivitiesForCalendar,
  type CalendarActivity,
} from "../../../supabase/supabase.activities";
import { useAuthContext } from "../../../contexts/Auth/useAuthContext";

// Define the context type
type CalendarContextType = {
  visibleWeeks: Date[];
  setVisibleWeeks: React.Dispatch<React.SetStateAction<Date[]>>;
  currentWeek: Date;
  today: Date;
  selectedDate: Date | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
  loadMoreWeeks: (direction: "before" | "after") => void;
  handleDayClick: (day: Date) => void;
  handleWorkoutClick: (workout: Workout) => void;
  handleWorkoutDayClick: (day: Date, workout?: Workout) => void;
  selectedWorkout: Workout | null;
  setSelectedWorkout: React.Dispatch<React.SetStateAction<Workout | null>>;
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  isLoadingActivities: boolean;
  activitiesError: string | null;
  refreshActivities: () => Promise<void>;
};

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

type CalendarProviderProps = {
  children: ReactNode;
};

// Provider component that will wrap components needing access to the calendar context
export const CalendarContextProvider: React.FC<CalendarProviderProps> = ({
  children,
}) => {
  // Get authenticated user
  const { user } = useAuthContext();

  // State and methods will be added here later
  const [visibleWeeks, setVisibleWeeks] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentWeek] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [selectedWorkout, setSelectedWorkout] = React.useState(
    null as Workout | null
  );
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const today = new Date();

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedWorkout(null);
  };

  const handleWorkoutDayClick = (day: Date, workout?: Workout) => {
    setSelectedDate(day);

    if (workout) {
      setSelectedWorkout(workout);
    } else {
      setSelectedWorkout(null);
    }
  };

  const handleWorkoutClick = (workout: Workout) => {
    if (workout.id === selectedWorkout?.id) {
      setSelectedWorkout(null);
    } else {
      setSelectedWorkout(workout);
    }
  };

  const loadMoreWeeks = useCallback((direction: "before" | "after") => {
    setVisibleWeeks((prev) => {
      // Limit the total number of weeks to prevent memory issues
      if (prev.length >= MAX_WEEKS) {
        if (direction === "before") {
          // Remove weeks from the end when adding to the beginning
          const firstWeek = prev[0];
          const newWeeks = Array.from({ length: WEEKS_TO_LOAD }, (_, i) =>
            subWeeks(firstWeek, i + 1)
          ).reverse();
          return [...newWeeks, ...prev.slice(0, MAX_WEEKS - WEEKS_TO_LOAD)];
        } else {
          // Remove weeks from the beginning when adding to the end
          const lastWeek = prev[prev.length - 1];
          const newWeeks = Array.from({ length: WEEKS_TO_LOAD }, (_, i) =>
            addWeeks(lastWeek, i + 1)
          );
          return [...prev.slice(WEEKS_TO_LOAD), ...newWeeks];
        }
      } else {
        // Normal loading when under the limit
        if (direction === "before") {
          const firstWeek = prev[0];
          const newWeeks = Array.from({ length: WEEKS_TO_LOAD }, (_, i) =>
            subWeeks(firstWeek, i + 1)
          ).reverse();
          return [...newWeeks, ...prev];
        } else {
          const lastWeek = prev[prev.length - 1];
          const newWeeks = Array.from({ length: WEEKS_TO_LOAD }, (_, i) =>
            addWeeks(lastWeek, i + 1)
          );
          return [...prev, ...newWeeks];
        }
      }
    });
  }, []);

  // Function to fetch activities from Supabase
  const refreshActivities = useCallback(async () => {
    if (!user || !visibleWeeks.length) {
      return;
    }

    setIsLoadingActivities(true);
    setActivitiesError(null);

    try {
      console.log(
        "Fetching activities for visible weeks:",
        visibleWeeks.length
      );
      const activities = await fetchActivitiesForCalendar(user, visibleWeeks);

      // Convert CalendarActivity to Workout format
      const workoutsFromActivities: Workout[] = activities.map(
        (activity: CalendarActivity) => ({
          id: activity.id,
          date: activity.date,
          name: activity.name,
          duration: activity.duration,
          type: activity.type,
          description: activity.description,
        })
      );

      // Use only real data from Supabase
      setWorkouts([...workoutsFromActivities]);

      console.log(
        `Loaded ${workoutsFromActivities.length} activities from Supabase`
      );
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivitiesError(
        error instanceof Error ? error.message : "Failed to fetch activities"
      );
      // Clear workouts on error
      setWorkouts([]);
    } finally {
      setIsLoadingActivities(false);
    }
  }, [user, visibleWeeks]);

  // Effect to load activities when visible weeks or user changes
  useEffect(() => {
    refreshActivities();
  }, [refreshActivities]);

  const value: CalendarContextType = {
    selectedDate,
    visibleWeeks,
    setVisibleWeeks,
    currentWeek,
    today,
    setSelectedDate,
    loadMoreWeeks,
    handleDayClick,
    handleWorkoutClick,
    handleWorkoutDayClick,
    selectedWorkout,
    setSelectedWorkout,
    workouts,
    setWorkouts,
    isLoadingActivities,
    activitiesError,
    refreshActivities,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hook for consuming the context
export const useCalendarContext = (): CalendarContextType => {
  const context = useContext(CalendarContext);

  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }

  return context;
};

export default CalendarContextProvider;
