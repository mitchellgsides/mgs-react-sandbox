import { useCalendarContext } from "../../context/CalendarContext";
import styled from "styled-components";

const WorkoutDetails = () => {
  const { selectedWorkout } = useCalendarContext();
  return (
    <SelectedWorkoutDetails isOpen={!!selectedWorkout}>
      {selectedWorkout?.description}
    </SelectedWorkoutDetails>
  );
};

export default WorkoutDetails;

const SelectedWorkoutDetails = styled.div<{ isOpen: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  flex: 1;
  background-color: ${({ theme, isOpen }) =>
    isOpen ? `${theme.colors.primary}20` : theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;
