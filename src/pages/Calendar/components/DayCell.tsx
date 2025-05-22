import { format, isSameDay, isToday } from "date-fns";
import styled from "styled-components";

type Props = {
  selectedDate: Date;
  day: Date;
  handleDayClick: (day: Date) => void;
};

const DayCell = ({ selectedDate, day, handleDayClick }: Props) => {
  return (
    <DayCellContainer
      key={day.toISOString()}
      isToday={isToday(day)}
      isSelected={isSameDay(day, selectedDate)}
      onClick={() => handleDayClick(day)}
    >
      <DayHeader>
        <DayNumber isToday={isToday(day)}>
          {day.getDate() === 1
            ? `${format(day, "MMM")} ${format(day, "d")}`
            : format(day, "d")}
        </DayNumber>
        <DayName>{format(day, "EEE")}</DayName>
      </DayHeader>
      <EventsContainer>
        {/* Event items will be rendered here */}
      </EventsContainer>
    </DayCellContainer>
  );
};

export default DayCell;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const DayNumber = styled.span<{ isToday?: boolean }>`
  font-weight: ${({ isToday }) => (isToday ? "bold" : "normal")};
  font-size: 1.2rem;
`;

const DayName = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
`;

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DayCellContainer = styled.div<{
  isToday?: boolean;
  isSelected?: boolean;
}>`
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? `${theme.colors.primary}15` : "transparent"};
  transition: background-color 0.2s;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      isSelected
        ? `${theme.colors.primary}25`
        : `${theme.colors.background}50`};
  }
`;
