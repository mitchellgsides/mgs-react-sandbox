import { eachDayOfInterval, endOfWeek } from "date-fns";
import styled from "styled-components";
import DayCalendarCell from "./DayCalendarCell";

type WeekRowProps = {
  weekStart: Date;
  isCurrentWeekRow: boolean;
  handleDayClick: (day: Date) => void;
  selectedDate: Date | null;
};

const WeekRow = ({
  weekStart,
  isCurrentWeekRow,
  handleDayClick,
  selectedDate,
}: WeekRowProps) => {
  return (
    <WeekRowContainer
      key={weekStart.toISOString()}
      id={isCurrentWeekRow ? "current-week" : undefined}
      isCurrentWeek={isCurrentWeekRow}
      data-week-start={weekStart.toISOString()}
    >
      {eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: 0 }),
      }).map((day) => (
        <DayCalendarCell
          key={day.toISOString()}
          day={day}
          handleDayClick={handleDayClick}
          selectedDate={selectedDate}
          isCurrentWeek={isCurrentWeekRow}
        />
      ))}
    </WeekRowContainer>
  );
};

export default WeekRow;

const WeekRowContainer = styled.div<{ isCurrentWeek?: boolean }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  height: ${({ isCurrentWeek }) => (isCurrentWeek ? "240px" : "200px")};
  background-color: ${({ isCurrentWeek, theme }) =>
    isCurrentWeek ? `${theme.colors.surface}` : "transparent"};
`;
