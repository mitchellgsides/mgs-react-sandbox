import { endOfWeek, format, startOfWeek } from "date-fns";
import styled from "styled-components";

type WeekSummaryProps = {
  selectedDate: Date | null;
};

const WeekSummary = ({ selectedDate }: WeekSummaryProps) => {
  return (
    <WeekSummaryContainer>
      <DetailHeader>
        <h3>Week Summary</h3>
      </DetailHeader>
      <WeekSummaryContent>
        {/* Week summary content will go here */}
        <p>
          Summary of events for the week of{" "}
          {selectedDate != null &&
            format(
              startOfWeek(selectedDate, { weekStartsOn: 0 }),
              "MMM d"
            )}{" "}
          -{" "}
          {selectedDate != null &&
            format(endOfWeek(selectedDate, { weekStartsOn: 0 }), "MMM d")}
        </p>
      </WeekSummaryContent>
    </WeekSummaryContainer>
  );
};

export default WeekSummary;

const WeekSummaryContainer = styled.div`
  flex: 1;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  // background-color: ${({ theme }) => theme.colors.surface};
  overflow-y: auto;
`;

const WeekSummaryContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

export const DetailHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h2,
  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
`;
