import { format } from "date-fns";
import WeekSummary from "./WeekSummary";
import styled from "styled-components";
import { type Workout } from "../fakeData";
import { useCalendarContext } from "../context/CalendarContext";

type DayDetailsProps = {
  selectedDate: Date | null;
};

const DayDetails = ({ selectedDate }: DayDetailsProps) => {
  const { handleWorkoutClick, selectedWorkout, workouts } =
    useCalendarContext();

  return (
    <DetailSection>
      <DayDetailContainer>
        <DetailHeader>
          <h2>
            {selectedDate != null && format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h2>
        </DetailHeader>
        <DayContent>
          <WorkoutDetails>
            {workouts.map((workout: Workout) => {
              const { id, name, duration } = workout;
              return (
                <DayItem
                  key={name}
                  onClick={() => handleWorkoutClick(workout)}
                  isSelected={selectedWorkout?.id === id}
                >
                  <div>{name}</div>
                  <div>{duration ?? ""}</div>
                </DayItem>
              );
            })}
          </WorkoutDetails>
          {selectedWorkout ? (
            <SelectedWorkoutDetails isOpen={!!selectedWorkout}>
              {selectedWorkout?.description}
            </SelectedWorkoutDetails>
          ) : (
            <div />
          )}
        </DayContent>
      </DayDetailContainer>

      <WeekSummary selectedDate={selectedDate} />
    </DetailSection>
  );
};

export default DayDetails;

const DetailSection = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.spacing.sm}; /* Reduced from md to sm */
  height: calc(50vh - 100px);
  min-height: 300px;
`;

const DayItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  padding: 4px 6px;
  cursor: pointer;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? `${theme.colors.primary}20` : "transparent"};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 4px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}20;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DayDetailContainer = styled.div`
  flex: 2;
  border-radius: 8px;
  margin-right: ${({ theme }) => theme.spacing.sm}; /* Reduced from md to sm */
  overflow-y: auto;
`;

const WorkoutDetails = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};

  h2,
  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

const DayContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 3fr;
`;

const SelectedWorkoutDetails = styled.div<{ isOpen: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  flex: 1;
  background-color: ${({ theme, isOpen }) =>
    isOpen ? `${theme.colors.primary}20` : theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;
