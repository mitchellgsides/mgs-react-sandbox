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
  font-size: 0.65rem; /* Reduced from 1rem */
  color: ${({ theme }) => theme.colors.text}cc;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: right;
  max-width: 35%; /* Increased slightly to accommodate smaller text */
  padding-left: 2px; /* Reduced from 4px */
  flex-shrink: 0;
  align-self: flex-start; /* Align to top when text wraps */
  line-height: 1.2;

  /* Responsive font sizing */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 0.6rem;
    max-width: 40%;
    padding-left: 1px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.55rem;
    max-width: 45%;
    padding-left: 1px;
  }

  /* Extra small screens */
  @media (max-width: 480px) {
    font-size: 0.5rem;
    max-width: 50%;
    padding-left: 0;
  }
`;
