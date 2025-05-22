import { format } from "date-fns";
import WeekSummary from "./WeekSummary";
import styled from "styled-components";

type DayDetailsProps = {
  selectedDate: Date;
};

const DayDetails = ({ selectedDate }: DayDetailsProps) => {
  return (
    <DetailSection>
      <DayDetailContainer>
        <DetailHeader>
          <h2>{format(selectedDate, "EEEE, MMMM d, yyyy")}</h2>
        </DetailHeader>
        <DayContent>
          {/* Day detail content will go here */}
          <p>Events for the selected day will appear here.</p>
        </DayContent>
      </DayDetailContainer>

      <WeekSummary selectedDate={selectedDate} />
    </DetailSection>
  );
};

export default DayDetails;

const DetailSection = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.spacing.sm}; /* Reduced from md to sm */
  height: calc(50vh - 100px);
  min-height: 300px;
`;

const DayDetailContainer = styled.div`
  flex: 2;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-right: ${({ theme }) => theme.spacing.sm}; /* Reduced from md to sm */
  background-color: ${({ theme }) => theme.colors.surface};
  overflow-y: auto;
`;

const DetailHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};

  h2,
  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

const DayContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;
