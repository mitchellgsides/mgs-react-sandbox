import React, { useRef, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { format, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import DayDetails from "./components/DayDetails";
import WeekRow from "./components/WeekRow";
import { useCalendarContext } from "./context/CalendarContext";

// Constants for performance optimization
export const MAX_WEEKS = 20; // Maximum number of weeks to keep in memory
export const WEEKS_TO_LOAD = 5; // Number of weeks to load at a time

const CalendarPage: React.FC = () => {
  const {
    visibleWeeks,
    setVisibleWeeks,
    selectedDate,
    setSelectedDate,
    currentWeek,
    today,
    loadMoreWeeks,
    handleDayClick,
  } = useCalendarContext();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Throttle scroll handling to improve performance
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  // Initialize with 10 weeks (5 before current, 5 after)
  useEffect(() => {
    const initialWeeks = [];
    for (let i = -5; i <= 5; i++) {
      initialWeeks.push(addWeeks(currentWeek, i));
    }
    setVisibleWeeks(initialWeeks);
  }, [currentWeek]);

  // Scroll to center only when component mounts
  useEffect(() => {
    if (scrollContainerRef.current && calendarRef.current) {
      scrollToToday();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const todayWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });

    // Reset visible weeks around today to prevent memory bloat
    setVisibleWeeks(() => {
      const initialWeeks = [];
      for (let i = -5; i <= 5; i++) {
        initialWeeks.push(addWeeks(todayWeekStart, i));
      }
      return initialWeeks;
    });

    const todayStart = new Date(); // Get the current date and time
    setSelectedDate(todayStart);

    // Schedule scrolling after state update and rendering
    setTimeout(() => {
      const todayElement = document.getElementById("current-week");
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  }, []);

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

  // Navigation functions for months
  const navigatePrevMonth = useCallback(() => {
    // Find most visible week, then go back 4 weeks
    if (scrollContainerRef.current) {
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const weekElements = document.querySelectorAll("[data-week-start]");

      let mostVisibleWeek: Element | null = null;
      let maxVisibleArea = 0;

      weekElements.forEach((week) => {
        const rect = week.getBoundingClientRect();
        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, containerRect.bottom) -
            Math.max(rect.top, containerRect.top)
        );
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
          const currentVisibleWeek = new Date(weekStartAttr);
          // Go back 4 weeks (approximately 1 month)
          const targetWeek = subWeeks(currentVisibleWeek, 4);

          // Try to find a week element for the target week
          const targetElement = document.querySelector(
            `[data-week-start="${targetWeek.toISOString()}"]`
          );

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } else {
            // If week isn't loaded yet, reset weeks around target week and scroll
            setVisibleWeeks(() => {
              const newWeeks = [];
              for (let i = -5; i <= 5; i++) {
                newWeeks.push(addWeeks(targetWeek, i));
              }
              return newWeeks;
            });

            setTimeout(() => {
              const newTargetElement = document.querySelector(
                `[data-week-start="${targetWeek.toISOString()}"]`
              );
              if (newTargetElement) {
                newTargetElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }, 50);
          }
        }
      }
    }
  }, []);

  const navigateNextMonth = useCallback(() => {
    // Similar to prev month but adding 4 weeks
    if (scrollContainerRef.current) {
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const weekElements = document.querySelectorAll("[data-week-start]");

      let mostVisibleWeek: Element | null = null;
      let maxVisibleArea = 0;

      weekElements.forEach((week) => {
        const rect = week.getBoundingClientRect();
        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, containerRect.bottom) -
            Math.max(rect.top, containerRect.top)
        );
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
          const currentVisibleWeek = new Date(weekStartAttr);
          // Go forward 4 weeks (approximately 1 month)
          const targetWeek = addWeeks(currentVisibleWeek, 4);

          // Try to find a week element for the target week
          const targetElement = document.querySelector(
            `[data-week-start="${targetWeek.toISOString()}"]`
          );

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } else {
            // If week isn't loaded yet, reset weeks around target week and scroll
            setVisibleWeeks(() => {
              const newWeeks = [];
              for (let i = -5; i <= 5; i++) {
                newWeeks.push(addWeeks(targetWeek, i));
              }
              return newWeeks;
            });

            setTimeout(() => {
              const newTargetElement = document.querySelector(
                `[data-week-start="${targetWeek.toISOString()}"]`
              );
              if (newTargetElement) {
                newTargetElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }, 50);
          }
        }
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
        <HeaderLeft>
          <MonthNavigationButtons>
            <NavButton onClick={navigatePrevMonth} aria-label="Previous month">
              <IoChevronBack />
            </NavButton>
            <CalendarTitle>{currentVisibleMonth}</CalendarTitle>
            <NavButton onClick={navigateNextMonth} aria-label="Next month">
              <IoChevronForward />
            </NavButton>
          </MonthNavigationButtons>
          <TodayButton onClick={scrollToToday}>Today</TodayButton>
        </HeaderLeft>
      </CalendarHeader>

      <CalendarContent>
        <DayTitles>
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day) => (
            <DayTitleItem key={day}>{day}</DayTitleItem>
          ))}
        </DayTitles>
        <CalendarContainer ref={scrollContainerRef} onScroll={handleScroll}>
          <Calendar ref={calendarRef}>
            {visibleWeeks.map((weekStart) => {
              const isCurrentWeekRow = isSameDay(
                startOfWeek(today, { weekStartsOn: 0 }),
                weekStart
              );

              return (
                <WeekRow
                  isCurrentWeekRow={isCurrentWeekRow}
                  key={weekStart.toISOString()}
                  weekStart={weekStart}
                  handleDayClick={handleDayClick}
                  selectedDate={selectedDate}
                />
              );
            })}
          </Calendar>
        </CalendarContainer>

        <DayDetails selectedDate={selectedDate} />
      </CalendarContent>
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
  flex-direction: column;
  margin-bottom: 0; /* Remove margin to align perfectly with grid below */
  padding: 8px;
`;

const CalendarTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const DayTitles = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* margin accounts for scrollbar width in CalendarContainer*/
  margin-right: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const DayTitleItem = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  font-size: 0.9rem;

  &:last-child {
    border-right: none;
  }
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

const HeaderLeft = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const MonthNavigationButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NavButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background}50;
  }
`;

const CalendarContent = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
`;

const CalendarContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none; /* Remove border-top since DayTitles has it */
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  max-height: 45vh;
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: 20px;
    border: 2px solid ${({ theme }) => theme.colors.background};
  }
`;

const Calendar = styled.div`
  width: 100%;
`;

export default CalendarPage;
