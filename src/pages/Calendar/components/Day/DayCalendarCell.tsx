import { format, isSameDay, isToday } from "date-fns";
import styled from "styled-components";
import { useCalendarContext } from "../../context/CalendarContext";
import type { Workout } from "../../context/fakeData";
import DayText from "../../shared-styles/DayText";
import { WorkoutDuration } from "../../../../components/DisplayStyles";

type DayCellProps = {
  day: Date;
  isCurrentWeek: boolean;
};

const DayCalendarCell = ({ isCurrentWeek, day }: DayCellProps) => {
  const {
    handleDayClick,
    handleWorkoutDayClick,
    workouts,
    selectedWorkout,
    selectedDate,
  } = useCalendarContext();

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
        {workouts
          .filter((wo) => isSameDay(day, wo.date))
          .map((workout: Workout) => {
            const { id, name } = workout;
            return (
              <WorkoutContainer
                isSelected={selectedWorkout?.id === id}
                key={`${id}-${name}-${day.toISOString()}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleWorkoutDayClick(day, workout);
                }}
              >
                <DayText
                  size={16}
                  workoutType={workout.type}
                  text={workout.name}
                  showIcon
                />
                <WorkoutDuration duration={workout.duration ?? ""} />
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
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  padding-bottom: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}40;
  flex-shrink: 0;
`;

const DayNumber = styled.span<{ isToday?: boolean }>`
  font-weight: ${({ isToday }) => (isToday ? "bold" : "normal")};
  font-size: ${({ isToday }) => (isToday ? "1rem" : "0.9rem")};
  color: ${({ isToday, theme }) =>
    isToday ? theme.colors.primary : theme.colors.text};
`;

const WorkoutContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 3px 6px;
  margin-bottom: 3px;
  border-radius: 4px;
  min-height: 24px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}10;
  }
  background-color: ${({ isSelected, theme }) =>
    isSelected ? `${theme.colors.primary}20` : `${theme.colors.surface}30`};
`;

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 4px;
  max-height: calc(100% - 30px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: 2px;
  }
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
  display: flex;
  flex-direction: column;
  height: 100%;

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
