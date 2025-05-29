import styled from "styled-components";

type WorkoutDurationProps = {
  duration: string;
};

export const WorkoutDuration = ({ duration }: WorkoutDurationProps) => {
  return (
    <WorkoutDurationContainer>
      {duration.replace(/^0+:/, "")}
    </WorkoutDurationContainer>
  );
};

export const WorkoutDurationContainer = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text}cc;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: right;
  max-width: 30%;
  padding-left: 4px;
`;
