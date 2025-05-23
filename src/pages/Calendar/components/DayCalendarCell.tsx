import { format, isSameDay, isToday } from "date-fns";
import styled from "styled-components";
import { useCalendarContext } from "../context/CalendarContext";
import type { Workout } from "../fakeData";

type DayCellProps = {
  selectedDate: Date | null;
  day: Date;
  handleDayClick: (day: Date) => void;
  isCurrentWeek: boolean;
};

const DayCalendarCell = ({
  isCurrentWeek,
  selectedDate,
  day,
  handleDayClick,
}: DayCellProps) => {
  const { handleWorkoutClick, workouts, selectedWorkout } =
    useCalendarContext();

  return (
    <DayCellContainer
      key={day.toISOString()}
      isToday={isToday(day)}
      isSelected={selectedDate != null && isSameDay(day, selectedDate)}
      onClick={() => handleDayClick(day)}
      isCurrentWeek={isCurrentWeek}
    >
      <DayHeader>
        <DayNumber isToday={isToday(day)}>
          {day.getDate() === 1
            ? `${format(day, "MMM")} ${format(day, "d")}`
            : format(day, "d")}
        </DayNumber>
      </DayHeader>
      <EventsContainer>
        {workouts.map((workout: Workout) => {
          const { id, name } = workout;
          return (
            <WorkoutContainer
              isSelected={selectedWorkout?.id === id}
              key={`${id}-${name}-${day.toISOString()}`}
              onClick={() => handleWorkoutClick(workout)}
            >
              <DayName>{workout.name}</DayName>
              <DayName>{workout.duration ?? ""}</DayName>
            </WorkoutContainer>
          );
        })}
      </EventsContainer>
    </DayCellContainer>
  );
};

export default DayCalendarCell;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const DayNumber = styled.span<{ isToday?: boolean }>`
  font-weight: ${({ isToday }) => (isToday ? "bold" : "normal")};
  font-size: 0.8rem;
`;

const WorkoutContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.text}50;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}10;
  }
  background-color: ${({ isSelected, theme }) =>
    isSelected ? `${theme.colors.primary}20` : "transparent"};
`;

const DayName = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
`;

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DayCellContainer = styled.div<{
  isToday?: boolean;
  isSelected?: boolean;
  isCurrentWeek?: boolean;
}>`
  border-right: 1px solid
    ${({ theme, isCurrentWeek }) =>
      isCurrentWeek ? theme.colors.background : theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? `${theme.colors.primary}15` : "transparent"};
  transition: background-color 0.2s;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      isSelected
        ? `${theme.colors.primary}25`
        : `${theme.colors.background}50`};
  }
`;
