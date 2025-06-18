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
  padding-bottom: 1px; /* Reduced from 2px */
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}40;
  flex-shrink: 0;

  /* Responsive adjustments */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-bottom: 1px;
    padding-bottom: 0.5px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-bottom: 0.5px;
    padding-bottom: 0;
  }

  /* Extra small screens */
  @media (max-width: 480px) {
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const DayNumber = styled.span<{ isToday?: boolean }>`
  font-weight: ${({ isToday }) => (isToday ? "bold" : "normal")};
  font-size: ${({ isToday }) =>
    isToday ? "0.85rem" : "0.75rem"}; /* Reduced from 0.9rem/0.8rem */
  color: ${({ isToday, theme }) =>
    isToday ? theme.colors.primary : theme.colors.text};

  /* Responsive font sizing */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ isToday }) => (isToday ? "0.75rem" : "0.65rem")};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ isToday }) => (isToday ? "0.65rem" : "0.55rem")};
  }

  /* Extra small screens */
  @media (max-width: 480px) {
    font-size: ${({ isToday }) => (isToday ? "0.6rem" : "0.5rem")};
  }
`;

const WorkoutContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start; /* Changed from center to flex-start for better wrapping */
  width: 100%;
  padding: 3px 4px; /* Increased padding slightly for wrapped text */
  margin-bottom: 2px;
  border-radius: 3px;
  min-height: 20px; /* Slightly increased to accommodate wrapped text */
  font-size: 0.7rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}10;
  }
  background-color: ${({ isSelected, theme }) =>
    isSelected ? `${theme.colors.primary}20` : `${theme.colors.surface}30`};

  /* Responsive sizing for smaller screens */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2px 3px;
    min-height: 18px;
    font-size: 0.65rem;
    margin-bottom: 1px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 2px 2px;
    min-height: 16px;
    font-size: 0.6rem;
    margin-bottom: 1px;
  }

  /* Extra small screens */
  @media (max-width: 480px) {
    padding: 1px 1px;
    min-height: 14px;
    font-size: 0.55rem;
    margin-bottom: 0.5px;
    border-radius: 2px;
  }
`;

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 2px; /* Reduced from 4px */
  max-height: calc(100% - 25px); /* Reduced from 30px */
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px; /* Reduced from 4px */
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: 2px;
  }

  /* Responsive adjustments */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-top: 1px;
    max-height: calc(100% - 20px);
    gap: 0.5px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-top: 0.5px;
    max-height: calc(100% - 15px);
    gap: 0.5px;
  }

  /* Extra small screens */
  @media (max-width: 480px) {
    margin-top: 0;
    max-height: calc(100% - 12px);
    gap: 0;

    &::-webkit-scrollbar {
      width: 2px;
    }
  }
`;

const DayCellContainer = styled.div<{
  isToday?: boolean;
  isSelected?: boolean;
  isCurrentWeek?: boolean;
}>`
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.xs}; /* Reduced from sm */
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

  /* Responsive adjustments for smaller screens */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2px; /* Even smaller padding on medium screens */
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1px; /* Minimal padding on small screens */
  }
`;
