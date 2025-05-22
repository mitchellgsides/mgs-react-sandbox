import React, { useRef, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
  eachDayOfInterval,
} from "date-fns";
import DayDetails from "./components/DayDetails";
import DayCell from "./components/DayCell";

const CalendarPage: React.FC = () => {
  const [visibleWeeks, setVisibleWeeks] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // @ts-expect-error unused variable
  const [currentWeek, setCurrentWeek] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  // Initialize with 10 weeks (5 before current, 5 after)
  useEffect(() => {
    const initialWeeks = [];
    for (let i = -5; i <= 5; i++) {
      initialWeeks.push(addWeeks(currentWeek, i));
    }
    setVisibleWeeks(initialWeeks);
  }, []);

  // Scroll to center only when component mounts
  useEffect(() => {
    if (scrollContainerRef.current && calendarRef.current) {
      scrollToToday();
    }
    // Only run once on mount, no dependencies
  }, []);

  // Constants for performance optimization
  const MAX_WEEKS = 20; // Maximum number of weeks to keep in memory
  const WEEKS_TO_LOAD = 5; // Number of weeks to load at a time

  const loadMoreWeeks = useCallback(
    (direction: "before" | "after") => {
      setVisibleWeeks((prev) => {
        // Limit the total number of weeks to prevent memory issues
        if (prev.length >= MAX_WEEKS) {
          if (direction === "before") {
            // Remove weeks from the end when adding to the beginning
            const firstWeek = prev[0];
            const newWeeks = Array.from({ length: WEEKS_TO_LOAD }, (_, i) =>
              subWeeks(firstWeek, i + 1)
            ).reverse();
            return [...newWeeks, ...prev.slice(0, MAX_WEEKS - WEEKS_TO_LOAD)];
          } else {
            // Remove weeks from the beginning when adding to the end
            const lastWeek = prev[prev.length - 1];
            const newWeeks = Array.from({ length: WEEKS_TO_LOAD }, (_, i) =>
              addWeeks(lastWeek, i + 1)
            );
            return [...prev.slice(WEEKS_TO_LOAD), ...newWeeks];
          }
        } else {
          // Normal loading when under the limit
          if (direction === "before") {
            const firstWeek = prev[0];
            const newWeeks = Array.from({ length: WEEKS_TO_LOAD }, (_, i) =>
              subWeeks(firstWeek, i + 1)
            ).reverse();
            return [...newWeeks, ...prev];
          } else {
            const lastWeek = prev[prev.length - 1];
            const newWeeks = Array.from({ length: WEEKS_TO_LOAD }, (_, i) =>
              addWeeks(lastWeek, i + 1)
            );
            return [...prev, ...newWeeks];
          }
        }
      });
    },
    [MAX_WEEKS, WEEKS_TO_LOAD]
  );

  // Throttle scroll handling to improve performance
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingRef.current) return;

    // Implement throttling to prevent excessive calls
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current!;
      const scrollPosition = scrollTop / (scrollHeight - clientHeight);

      // Load more weeks when scrolling near the edges
      if (scrollPosition < 0.2) {
        isLoadingRef.current = true;
        loadMoreWeeks("before");
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 200);
      } else if (scrollPosition > 0.8) {
        isLoadingRef.current = true;
        loadMoreWeeks("after");
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 200);
      }

      scrollTimeoutRef.current = null;
    }, 150); // Throttle to 150ms
  }, [loadMoreWeeks]);

  const scrollToToday = useCallback(() => {
    if (!scrollContainerRef.current || !calendarRef.current) return;

    // Reset to a more manageable number of weeks when clicking Today
    const todayStart = startOfWeek(new Date(), { weekStartsOn: 0 });

    // Reset visible weeks around today to prevent memory bloat
    setVisibleWeeks(() => {
      const initialWeeks = [];
      for (let i = -5; i <= 5; i++) {
        initialWeeks.push(addWeeks(todayStart, i));
      }
      return initialWeeks;
    });

    // Schedule scrolling after state update and rendering
    setTimeout(() => {
      const todayElement = document.getElementById("current-week");
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  }, []);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  // Track the current visible month for the header
  const [currentVisibleMonth, setCurrentVisibleMonth] = useState(
    format(new Date(), "MMMM yyyy")
  );

  // Update current visible month when scrolling
  const updateVisibleMonth = useCallback(() => {
    if (!scrollContainerRef.current) return;

    // Find the week that's most visible in the viewport
    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const weekElements = document.querySelectorAll("[data-week-start]");

    let mostVisibleWeek: Element | null = null;
    let maxVisibleArea = 0;

    weekElements.forEach((week) => {
      const rect = week.getBoundingClientRect();
      // Calculate the visible area of this week
      const visibleTop = Math.max(rect.top, containerRect.top);
      const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibleArea = visibleHeight * rect.width;

      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        mostVisibleWeek = week;
      }
    });

    if (mostVisibleWeek) {
      const weekStartAttr = (mostVisibleWeek as Element).getAttribute(
        "data-week-start"
      );
      if (weekStartAttr) {
        const weekStart = new Date(weekStartAttr);
        setCurrentVisibleMonth(format(weekStart, "MMMM yyyy"));
      }
    }
  }, []);

  // Add scroll event to update visible month
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateVisibleMonth);
      // Initial update
      updateVisibleMonth();
      return () => container.removeEventListener("scroll", updateVisibleMonth);
    }
  }, [updateVisibleMonth]);

  return (
    <PageContainer>
      <CalendarHeader>
        <CalendarTitle>{currentVisibleMonth}</CalendarTitle>
        <TodayButton onClick={scrollToToday}>Today</TodayButton>
      </CalendarHeader>

      <MainContent>
        <CalendarContainer ref={scrollContainerRef} onScroll={handleScroll}>
          <Calendar ref={calendarRef}>
            {visibleWeeks.map((weekStart) => {
              const isCurrentWeekRow = isSameDay(
                startOfWeek(today, { weekStartsOn: 0 }),
                weekStart
              );

              return (
                <WeekRow
                  key={weekStart.toISOString()}
                  id={isCurrentWeekRow ? "current-week" : undefined}
                  isCurrentWeek={isCurrentWeekRow}
                  data-week-start={weekStart.toISOString()}
                >
                  {eachDayOfInterval({
                    start: weekStart,
                    end: endOfWeek(weekStart, { weekStartsOn: 0 }),
                  }).map((day) => (
                    <DayCell
                      key={day.toISOString()}
                      day={day}
                      handleDayClick={handleDayClick}
                      selectedDate={selectedDate}
                    />
                  ))}
                </WeekRow>
              );
            })}
          </Calendar>
        </CalendarContainer>

        <DayDetails selectedDate={selectedDate} />
      </MainContent>
    </PageContainer>
  );
};

// Styled components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 1800px; /* Further increased from 1600px to maximize browser width usage */
  margin: 0 auto;
  padding: ${({ theme }) =>
    theme.spacing.xs}; /* Further reduced from sm to xs */
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm}; /* Reduced from md to sm */
  height: 40px; /* Make the header a bit shorter */
`;

const CalendarTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem; /* Smaller font size for a shorter header */
  font-weight: 600;
`;

const TodayButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.light};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
`;

const CalendarContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface};
  max-height: 45vh; /* Increased from fixed 400px to be more responsive */

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: 20px;
    border: 2px solid ${({ theme }) => theme.colors.surface};
  }
`;

const Calendar = styled.div`
  width: 100%;
`;

const WeekRow = styled.div<{ isCurrentWeek?: boolean }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  height: ${({ isCurrentWeek }) => (isCurrentWeek ? "220px" : "200px")};
  background-color: ${({ isCurrentWeek, theme }) =>
    isCurrentWeek ? `${theme.colors.surface}` : "transparent"};
`;

export default CalendarPage;
