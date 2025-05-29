import { useCalendarContext } from "../../context/CalendarContext";
import styled from "styled-components";
import TypeIcon from "../../shared-styles/TypeIcon";

const WorkoutDetails = () => {
  const { selectedWorkout } = useCalendarContext();
  return (
    <SelectedWorkoutDetails isOpen={!!selectedWorkout}>
      {selectedWorkout ? (
        <>
          <HeaderSection>
            {selectedWorkout.type && (
              <IconWrapper>
                <TypeIcon size={32} type={selectedWorkout.type} />
              </IconWrapper>
            )}
            {/* <Title>{selectedWorkout.type || "Workout"}</Title> */}
            <Title>{selectedWorkout.name}</Title>
            <Date>
              {selectedWorkout.date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Date>
          </HeaderSection>

          <DetailSection>
            <DetailItem>
              <Label>Duration:</Label>
              <Value>{selectedWorkout.duration} min</Value>
            </DetailItem>

            <DetailItem>
              <Label>Description:</Label>
              <Value>
                {selectedWorkout.description || "No description available"}
              </Value>
            </DetailItem>
          </DetailSection>
        </>
      ) : (
        <EmptyState>Select a workout to view details</EmptyState>
      )}
    </SelectedWorkoutDetails>
  );
};

export default WorkoutDetails;

const SelectedWorkoutDetails = styled.div<{ isOpen: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  flex: 1;
  flex-grow: 1;
  background-color: ${({ theme, isOpen }) =>
    isOpen ? `${theme.colors.primary}20` : theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  border-radius: 0px 0px 0px 0px;
  box-shadow: ${({ isOpen }) =>
    isOpen ? "0 2px 10px rgba(0,0,0,0.1)" : "none"};
  transition: all 0.3s ease;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.text}20`};
  flex-wrap: wrap;
`;

const IconWrapper = styled.div`
  margin-right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 1.4rem;
  margin: 0;
  margin-right: auto;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Date = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => `${theme.colors.text}99`};
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DetailItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.span`
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
`;

const Value = styled.div`
  padding: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => `${theme.colors.text}10`};
  border-radius: 4px;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => `${theme.colors.text}60`};
  font-style: italic;
`;
