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
      {showIcon && <TypeIcon size={size ?? 12} type={workoutType} />}
      <StyledDayText>{text}</StyledDayText>
    </TextContainer>
  );
};

export default DayText;

const StyledDayText = styled.div``;

const TextContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;
