import { eachDayOfInterval, endOfWeek, isSameDay } from "date-fns";
import styled from "styled-components";
import DayCalendarCell from "./Day/DayCalendarCell";
import { useCalendarContext } from "../context/CalendarContext";

type WeekRowProps = {
  weekStart: Date;
  isCurrentWeekRow: boolean;
};

const WeekRow = ({ weekStart, isCurrentWeekRow }: WeekRowProps) => {
  const { workouts } = useCalendarContext();

  // Calculate the max number of workouts for any day in this week
  const days = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 0 }),
  });

  // Count max workouts in any day of this week
  const maxWorkoutsInWeek = days.reduce((max, day) => {
    const workoutsInDay = workouts.filter((workout) =>
      isSameDay(day, workout.date)
    ).length;
    return Math.max(max, workoutsInDay);
  }, 0);

  // Calculate dynamic height based on workouts count
  // Base height + additional height per workout beyond 3 (since 3 fit comfortably)
  const getRowHeight = () => {
    const baseHeight = isCurrentWeekRow ? 240 : 200; // Increased base heights to accommodate text wrapping

    // Only grow if we have more than 3 workouts in any day of the week
    if (maxWorkoutsInWeek <= 3) {
      return baseHeight;
    }

    // Add additional height for each workout beyond 3, up to a reasonable maximum
    // Each workout item is approximately 32px (20px min-height + 6px padding + 2px margin + 4px buffer for wrapping)
    const additionalWorkouts = Math.min(maxWorkoutsInWeek - 3, 12); // Cap at 12 additional workouts for narrow views
    const additionalHeight = additionalWorkouts * 32; // 32px per additional workout (increased to account for text wrapping)

    return baseHeight + additionalHeight;
  };

  // Get calculated height
  const dynamicHeight = getRowHeight();

  return (
    <WeekRowContainer
      key={weekStart.toISOString()}
      id={isCurrentWeekRow ? "current-week" : undefined}
      isCurrentWeek={isCurrentWeekRow}
      data-week-start={weekStart.toISOString()}
      $customHeight={dynamicHeight}
    >
      {days.map((day) => (
        <DayCalendarCell
          key={day.toISOString()}
          day={day}
          isCurrentWeek={isCurrentWeekRow}
        />
      ))}
    </WeekRowContainer>
  );
};

export default WeekRow;

const WeekRowContainer = styled.div<{
  isCurrentWeek?: boolean;
  $customHeight?: number;
}>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  height: ${({ $customHeight, isCurrentWeek }) =>
    $customHeight ? `${$customHeight}px` : isCurrentWeek ? "240px" : "200px"};
  background-color: ${({ isCurrentWeek, theme }) =>
    isCurrentWeek ? `${theme.colors.surface}` : "transparent"};

  /* Responsive height adjustments for smaller screens - maintain proportions for text wrapping */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    height: ${({ $customHeight, isCurrentWeek }) =>
      $customHeight
        ? `${Math.max($customHeight * 0.9, 140)}px`
        : isCurrentWeek
        ? "200px"
        : "170px"};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: ${({ $customHeight, isCurrentWeek }) =>
      $customHeight
        ? `${Math.max($customHeight * 0.85, 120)}px`
        : isCurrentWeek
        ? "180px"
        : "150px"};
  }

  /* Extra small screens - still need adequate height for wrapped text */
  @media (max-width: 480px) {
    height: ${({ $customHeight, isCurrentWeek }) =>
      $customHeight
        ? `${Math.max($customHeight * 0.8, 100)}px`
        : isCurrentWeek
        ? "160px"
        : "130px"};
  }
`;
