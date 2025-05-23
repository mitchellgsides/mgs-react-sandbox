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
    const baseHeight = isCurrentWeekRow ? 240 : 200;

    // Only grow if we have more than 3 workouts in any day of the week
    if (maxWorkoutsInWeek <= 3) {
      return baseHeight;
    }

    // Add additional height for each workout beyond 3, up to a reasonable maximum
    const additionalWorkouts = Math.min(maxWorkoutsInWeek - 3, 10); // Cap at 10 additional workouts
    const additionalHeight = additionalWorkouts * 30; // 30px per additional workout

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
`;
