import styled from "styled-components";
import type { WorkoutType } from "../context/fakeData";
import TypeIcon from "./TypeIcon";

type DayTextProps = {
  text: string;
  size?: number;
  workoutType: WorkoutType;
  showIcon?: boolean;
};

const DayText = ({
  text,
  size,
  workoutType,
  showIcon = false,
}: DayTextProps) => {
  return (
    <TextContainer>
      {showIcon && <TypeIcon size={size ?? 10} type={workoutType} />}
      <StyledDayText>{text}</StyledDayText>
    </TextContainer>
  );
};

export default DayText;

const StyledDayText = styled.div`
  font-size: inherit;
  flex: 1;
  min-width: 0;
  line-height: 1.2;

  /* Default: single line with ellipsis for wider containers */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  /* Fallback for browsers without container query support */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    white-space: normal;
    word-break: break-word;
    overflow: visible;
    text-overflow: unset;
  }

  /* Enable wrapping when container gets narrow - if container queries are supported */
  @supports (container-type: inline-size) {
    @container (max-width: 80px) {
      white-space: normal;
      word-break: break-word;
      overflow: visible;
      text-overflow: unset;
    }
  }
`;

const TextContainer = styled.div`
  display: flex;
  align-items: flex-start; /* Changed from center to flex-start for better alignment when text wraps */
  gap: 3px;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text};
  min-width: 0;
  flex: 1;

  /* Enable container queries if supported */
  @supports (container-type: inline-size) {
    container-type: inline-size;
  }

  /* Responsive font sizing and spacing */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 0.65rem;
    gap: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.6rem;
    gap: 1px;

    /* At small screens, force text wrapping */
    ${StyledDayText} {
      white-space: normal;
      word-break: break-word;
      overflow: visible;
      text-overflow: unset;
    }
  }

  /* Extra small screens */
  @media (max-width: 480px) {
    font-size: 0.55rem;
    gap: 1px;

    /* At extra small screens, definitely wrap text */
    ${StyledDayText} {
      white-space: normal;
      word-break: break-word;
      overflow: visible;
      text-overflow: unset;
    }
  }
`;
