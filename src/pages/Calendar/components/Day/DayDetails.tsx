import { format, isSameDay } from "date-fns";
import WeekSummary from "../WeekSummary";
import WorkoutDetails from "./WorkoutDetails";
import styled from "styled-components";
import { useCalendarContext } from "../../context/CalendarContext";

const DayDetails = () => {
  const { handleWorkoutClick, selectedWorkout, selectedDate, workouts } =
    useCalendarContext();

  // Filter workouts for the selected date
  const dayWorkouts = workouts.filter(
    (wo) => selectedDate && isSameDay(wo.date, selectedDate)
  );

  return (
    <DetailSection>
      <DayDetailContainer>
        <DetailHeader>
          <h2>{selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</h2>
        </DetailHeader>
        <DayContent>
          <WorkoutList>
            {dayWorkouts.map((workout) => (
              <DayItem
                key={workout.id}
                onClick={() => handleWorkoutClick(workout)}
                isSelected={selectedWorkout?.id === workout.id}
              >
                <div>{workout.name}</div>
                <div>{workout.duration ?? ""}</div>
              </DayItem>
            ))}
          </WorkoutList>

          <WorkoutDetailPanel>
            {selectedWorkout ? <WorkoutDetails /> : null}
          </WorkoutDetailPanel>
        </DayContent>
      </DayDetailContainer>

      <WeekSummary selectedDate={selectedDate} />
    </DetailSection>
  );
};

export default DayDetails;

const DetailSection = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.spacing.sm};
  height: calc(50vh - 100px);
  min-height: 300px;
`;

const DayItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  margin-bottom: 4px;
  cursor: pointer;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? `${theme.colors.primary}20` : "transparent"};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 4px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}20;
  }
`;

const DayDetailContainer = styled.div`
  flex: 2;
  border-radius: 8px;
  margin-right: ${({ theme }) => theme.spacing.sm};
  overflow-y: auto;
`;

const WorkoutList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const WorkoutDetailPanel = styled.div`
  display: flex;
  flex-grow: 1;
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
  gap: ${({ theme }) => theme.spacing.md};
`;
