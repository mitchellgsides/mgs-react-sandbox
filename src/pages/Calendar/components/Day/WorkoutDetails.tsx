import { useCalendarContext } from "../../context/CalendarContext";
import styled from "styled-components";
import TypeIcon from "../../shared-styles/TypeIcon";
import { Link } from "react-router-dom";

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
              <Value>{selectedWorkout.description || ""}</Value>
            </DetailItem>
          </DetailSection>

          <ActionSection>
            <DetailsLink to={`/activities/${selectedWorkout.id}`}>
              View Full Details →
            </DetailsLink>
          </ActionSection>
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

const ActionSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => `${theme.colors.text}20`};
`;

const DetailsLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
