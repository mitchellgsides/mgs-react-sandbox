import React, { useState, useCallback, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  format,
  addWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isFirstDayOfMonth,
  isSameMonth,
  getMonth,
} from "date-fns";
// import { IoChevronDown, IoChevronUp } from "react-icons/io5";

// Define interfaces for future calendar functionality
// // @ts-expect-error - Will be used in future implementation
// interface CalendarEvent {
//   id: string;
//   title: string;
//   start: Date;
//   end: Date;
//   description?: string;
//   color?: string;
//   allDay?: boolean;
// }

// Component to render a week row
const WeekRow: React.FC<{
  startDate: Date;
  onHeightChange?: (height: number) => void;
}> = ({ startDate, onHeightChange }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  // Effect to report row height after rendering
  useEffect(() => {
    if (rowRef.current && onHeightChange) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeightChange(entry.contentRect.height);
        }
      });

      observer.observe(rowRef.current);
      return () => observer.disconnect();
    }
  }, [onHeightChange]);

  // Get all days in the week
  const weekStart = startOfWeek(startDate, { weekStartsOn: 0 }); // 0 means Sunday
  const weekEnd = endOfWeek(startDate, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <WeekContainer ref={rowRef}>
      {daysInWeek.map((day, index) => {
        const isTodayValue = isToday(day);
        const isFirstDay = isFirstDayOfMonth(day);

        // More precise month border positioning conditions
        const isMonthStart =
          index === 0 || !isSameMonth(day, daysInWeek[index - 1]);
        const isMonthEnd =
          index === 6 || !isSameMonth(day, daysInWeek[index + 1]);

        // Check if this is the first week of the month
        const isFirstWeekOfMonth =
          isFirstDay || (index > 0 && isFirstDayOfMonth(day));

        // Check if this is the last week of the month
        const isLastWeekOfMonth =
          isMonthEnd &&
          index < 6 &&
          (index + 1 >= daysInWeek.length ||
            !isSameMonth(day, daysInWeek[index + 1]));

        return (
          <DayCell
            key={day.toISOString()}
            isCurrentMonth={true}
            isMonthStart={isMonthStart}
            isMonthEnd={isMonthEnd}
            isFirstWeekOfMonth={isFirstWeekOfMonth}
            isLastWeekOfMonth={isLastWeekOfMonth}
            isFirstDayOfMonth={isFirstDay}
            month={getMonth(day)}
          >
            <DayHeader>
              <DayNumber className={isTodayValue ? "today" : ""}>
                {format(day, "d")}
                {isFirstDay && (
                  <MonthDayLabel>{format(day, "MMM")}</MonthDayLabel>
                )}
              </DayNumber>
            </DayHeader>
            {/* Event placeholders would go here */}
          </DayCell>
        );
      })}
    </WeekContainer>
  );
};

const CalendarPage: React.FC = () => {
  // Current date as a reference point
  const today = React.useMemo(() => new Date(), []);

  // Simple state for the visible date (month/year) in the header
  const [currentVisibleDate, setCurrentVisibleDate] = useState<Date>(today);

  // Track if we're currently loading more weeks
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);

  // Reference to the scroll container for infinite scroll implementation
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track last scroll position to determine direction
  const lastScrollTopRef = useRef<number>(0);

  // Store week heights to help with scroll position calculations
  const weekHeightsRef = useRef<Map<string, number>>(new Map());

  // Simple state for weeks in our infinite scroll
  const [weeks, setWeeks] = useState<Date[]>(() => {
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    const initialWeeks: Date[] = [];

    // Start with 24 weeks (12 before today, today's week, and 11 after)
    for (let i = -12; i < 12; i++) {
      initialWeeks.push(addWeeks(currentWeekStart, i));
    }

    return initialWeeks;
  });

  // Update the month label in the header based on visible weeks
  const updateVisibleMonthHeader = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    const containerRect = scrollContainer.getBoundingClientRect();

    // Find the first week that's visibly within the scroll container
    for (let i = 0; i < scrollContainer.children.length; i++) {
      const weekElement = scrollContainer.children[i] as HTMLElement;
      if (!weekElement) continue;

      const weekRect = weekElement.getBoundingClientRect();

      // Check if this week is visible (at least partially)
      if (
        weekRect.bottom > containerRect.top &&
        weekRect.top < containerRect.bottom
      ) {
        if (i < weeks.length) {
          const weekStartDate = weeks[i];

          // Find a date that's the last day of the week instead of mid-week
          const lastDayOfWeek = endOfWeek(weekStartDate, { weekStartsOn: 0 });
          setCurrentVisibleDate(
            new Date(
              lastDayOfWeek.getFullYear(),
              lastDayOfWeek.getMonth(),
              lastDayOfWeek.getDate()
            )
          );
          return;
        }
      }
    }
  }, [weeks]);

  // Handler for when a week's height changes
  const handleWeekHeightChange = useCallback(
    (weekKey: string, height: number) => {
      weekHeightsRef.current.set(weekKey, height);
    },
    []
  );

  // Load more weeks at the beginning (when scrolling up)
  const loadMoreWeeksAtTop = useCallback(() => {
    if (isLoadingWeeks) return;

    setIsLoadingWeeks(true);

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      setIsLoadingWeeks(false);
      return;
    }

    // Store current scroll position and heights
    const currentScrollTop = scrollContainer.scrollTop;
    const numWeeksToAdd = 8; // Load 8 weeks at a time

    setWeeks((prevWeeks) => {
      const firstWeek = prevWeeks[0];
      const newWeeksAtStart: Date[] = [];

      // Add new weeks at the start
      for (let i = numWeeksToAdd; i > 0; i--) {
        newWeeksAtStart.push(addWeeks(firstWeek, -i));
      }

      return [...newWeeksAtStart, ...prevWeeks];
    });

    // After state update, maintain scroll position
    requestAnimationFrame(() => {
      if (scrollContainer) {
        // Calculate height of added weeks
        let heightOfAddedWeeks = 0;
        for (let i = 0; i < numWeeksToAdd; i++) {
          const weekKey = format(addWeeks(weeks[0], -(i + 1)), "yyyy-MM-dd");
          const height = weekHeightsRef.current.get(weekKey) || 240; // Default height doubled to 240px
          heightOfAddedWeeks += height;
        }

        // Adjust scroll position to maintain the same relative view
        scrollContainer.scrollTop = currentScrollTop + heightOfAddedWeeks;

        // Update the month header and enable more loads
        requestAnimationFrame(() => {
          updateVisibleMonthHeader();
          setIsLoadingWeeks(false);
        });
      } else {
        setIsLoadingWeeks(false);
      }
    });
  }, [isLoadingWeeks, weeks, updateVisibleMonthHeader]);

  // Load more weeks at the end (when scrolling down)
  const loadMoreWeeksAtBottom = useCallback(() => {
    if (isLoadingWeeks) return;

    setIsLoadingWeeks(true);

    setWeeks((prevWeeks) => {
      const lastWeek = prevWeeks[prevWeeks.length - 1];
      const newWeeksAtEnd: Date[] = [];

      // Add 8 new weeks at the end
      for (let i = 1; i <= 8; i++) {
        newWeeksAtEnd.push(addWeeks(lastWeek, i));
      }

      return [...prevWeeks, ...newWeeksAtEnd];
    });

    // Update the month header and enable more loads
    requestAnimationFrame(() => {
      updateVisibleMonthHeader();
      setIsLoadingWeeks(false);
    });
  }, [isLoadingWeeks, updateVisibleMonthHeader]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingWeeks) return;

    const scrollContainer = scrollContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

    // Determine scroll direction
    const scrollDirection =
      scrollTop > lastScrollTopRef.current ? "down" : "up";

    // Update the month header
    updateVisibleMonthHeader();

    // Store the current scroll position for next comparison
    lastScrollTopRef.current = scrollTop;

    // When scrolling down and near the bottom (20% of container height remaining)
    const bottomThreshold = scrollHeight - scrollTop - clientHeight;
    if (scrollDirection === "down" && bottomThreshold < clientHeight * 0.2) {
      loadMoreWeeksAtBottom();
    }

    // When scrolling up and near the top (20% of container height from top)
    if (scrollDirection === "up" && scrollTop < clientHeight * 0.2) {
      loadMoreWeeksAtTop();
    }
  }, [
    isLoadingWeeks,
    updateVisibleMonthHeader,
    loadMoreWeeksAtBottom,
    loadMoreWeeksAtTop,
  ]);

  //   // Function to navigate to previous month (up arrow)
  //   const navigateUpMonth = useCallback(() => {
  //     if (isLoadingWeeks) return;

  //     // Calculate target month (previous month) based on currentVisibleDate
  //     const currentMonth = currentVisibleDate.getMonth();
  //     const currentYear = currentVisibleDate.getFullYear();
  //     const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  //     const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  //     // Target first day of the previous month
  //     const targetDate = new Date(targetYear, targetMonth, 1);
  //     const targetWeekStart = startOfWeek(targetDate, { weekStartsOn: 0 });

  //     // Find if this week is already in our range
  //     const targetWeekIndex = weeks.findIndex(
  //       (week) =>
  //         format(week, "yyyy-MM-dd") === format(targetWeekStart, "yyyy-MM-dd")
  //     );

  //     if (targetWeekIndex !== -1) {
  //       // Week is already loaded, just scroll to it
  //       const scrollContainer = scrollContainerRef.current;
  //       if (scrollContainer) {
  //         let topOffset = 0;

  //         // Calculate offset by summing heights of preceding weeks
  //         for (let i = 0; i < targetWeekIndex; i++) {
  //           const weekKey = format(weeks[i], "yyyy-MM-dd");
  //           const height = weekHeightsRef.current.get(weekKey) || 240;
  //           topOffset += height;
  //         }

  //         // Smooth scroll to target week
  //         scrollContainer.scrollTo({
  //           top: topOffset,
  //           behavior: "smooth",
  //         });

  //         // Update month header after scrolling
  //         setTimeout(updateVisibleMonthHeader, 500);
  //       }
  //     } else {
  //       // Today's week is not loaded, rebuild the weeks array centered around target date
  //       setIsLoadingWeeks(true);

  //       const newWeeks: Date[] = [];

  //       // Generate weeks centered around the target date (12 before, target week, and 11 after)
  //       for (let i = -12; i < 12; i++) {
  //         newWeeks.push(addWeeks(targetWeekStart, i));
  //       }

  //       setWeeks(newWeeks);

  //       // After rebuilding the weeks, scroll to the middle (target week)
  //       requestAnimationFrame(() => {
  //         const scrollContainer = scrollContainerRef.current;
  //         if (scrollContainer) {
  //           let topOffset = 0;

  //           // Calculate heights up to target week (index 12 in the new array)
  //           const weekElements = Array.from(scrollContainer.children);
  //           for (let i = 0; i < 12 && i < weekElements.length; i++) {
  //             const element = weekElements[i] as HTMLElement;
  //             topOffset += element.offsetHeight;
  //           }

  //           // Scroll to target week
  //           scrollContainer.scrollTop = topOffset;

  //           // Update header and enable more loads
  //           requestAnimationFrame(() => {
  //             updateVisibleMonthHeader();
  //             setIsLoadingWeeks(false);
  //           });
  //         } else {
  //           setIsLoadingWeeks(false);
  //         }
  //       });
  //     }
  //   }, [currentVisibleDate, weeks, isLoadingWeeks, updateVisibleMonthHeader]);

  //   // Function to navigate to next month (down arrow)
  //   const navigateDownMonth = useCallback(() => {
  //     if (isLoadingWeeks) return;

  //     // Calculate target month (next month) based on currentVisibleDate
  //     const currentMonth = currentVisibleDate.getMonth();
  //     const currentYear = currentVisibleDate.getFullYear();
  //     const targetMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  //     const targetYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  //     // Target first day of the next month
  //     const targetDate = new Date(targetYear, targetMonth, 1);
  //     const targetWeekStart = startOfWeek(targetDate, { weekStartsOn: 0 });

  //     // Find if this week is already in our range
  //     const targetWeekIndex = weeks.findIndex(
  //       (week) =>
  //         format(week, "yyyy-MM-dd") === format(targetWeekStart, "yyyy-MM-dd")
  //     );

  //     if (targetWeekIndex !== -1) {
  //       // Week is already loaded, just scroll to it
  //       const scrollContainer = scrollContainerRef.current;
  //       if (scrollContainer) {
  //         let topOffset = 0;

  //         // Calculate offset by summing heights of preceding weeks
  //         for (let i = 0; i < targetWeekIndex; i++) {
  //           const weekKey = format(weeks[i], "yyyy-MM-dd");
  //           const height = weekHeightsRef.current.get(weekKey) || 240;
  //           topOffset += height;
  //         }

  //         // Smooth scroll to target week
  //         scrollContainer.scrollTo({
  //           top: topOffset,
  //           behavior: "smooth",
  //         });

  //         // Update month header after scrolling
  //         setTimeout(updateVisibleMonthHeader, 500);
  //       }
  //     } else {
  //       // Week is not loaded, need to add weeks at the bottom
  //       setIsLoadingWeeks(true);

  //       // Calculate how many weeks we need to add
  //       const lastLoadedWeek = weeks[weeks.length - 1];
  //       const weeksDiff = Math.ceil(
  //         (targetWeekStart.getTime() - lastLoadedWeek.getTime()) /
  //           (7 * 24 * 60 * 60 * 1000)
  //       );

  //       // Add these weeks at the bottom
  //       if (weeksDiff > 0) {
  //         setWeeks((prevWeeks) => {
  //           const newWeeksAtEnd: Date[] = [];
  //           for (let i = 1; i <= weeksDiff; i++) {
  //             newWeeksAtEnd.push(addWeeks(lastLoadedWeek, i));
  //           }
  //           return [...prevWeeks, ...newWeeksAtEnd];
  //         });
  //       }

  //       // After adding weeks, scroll to the target week
  //       requestAnimationFrame(() => {
  //         const scrollContainer = scrollContainerRef.current;
  //         if (scrollContainer) {
  //           // The target week should now be at the previous length + weeksDiff
  //           const targetIndex = weeks.length;
  //           let topOffset = 0;

  //           // Calculate heights of preceding weeks
  //           const weekElements = Array.from(scrollContainer.children);
  //           for (let i = 0; i < targetIndex && i < weekElements.length; i++) {
  //             const element = weekElements[i] as HTMLElement;
  //             topOffset += element.offsetHeight;
  //           }

  //           // Scroll to the target week
  //           scrollContainer.scrollTo({
  //             top: topOffset,
  //             behavior: "smooth",
  //           });

  //           // Update month header after scrolling
  //           setTimeout(() => {
  //             updateVisibleMonthHeader();
  //             setIsLoadingWeeks(false);
  //           }, 500);
  //         } else {
  //           setIsLoadingWeeks(false);
  //         }
  //       });
  //     }
  //   }, [currentVisibleDate, weeks, isLoadingWeeks, updateVisibleMonthHeader]);

  // Function to scroll to today
  const scrollToToday = useCallback(() => {
    if (isLoadingWeeks) return;

    // Find today's week in our current weeks
    const todayStart = startOfWeek(today, { weekStartsOn: 0 });
    const todayWeekIndex = weeks.findIndex(
      (week) => format(week, "yyyy-MM-dd") === format(todayStart, "yyyy-MM-dd")
    );

    if (todayWeekIndex !== -1) {
      // Today's week is loaded, scroll to it
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        let topOffset = 0;

        // Calculate offset by summing heights of preceding weeks
        for (let i = 0; i < todayWeekIndex; i++) {
          const weekKey = format(weeks[i], "yyyy-MM-dd");
          const height = weekHeightsRef.current.get(weekKey) || 240;
          topOffset += height;
        }

        // Smooth scroll to today's week
        scrollContainer.scrollTo({
          top: topOffset,
          behavior: "smooth",
        });

        // Update month header after scrolling
        setTimeout(updateVisibleMonthHeader, 500);
      }
    } else {
      // Today's week is not loaded, rebuild the weeks array centered around today
      setIsLoadingWeeks(true);

      const todayStart = startOfWeek(today, { weekStartsOn: 0 });
      const newWeeks: Date[] = [];

      // Generate weeks centered around today (12 before, today, and 11 after)
      for (let i = -12; i < 12; i++) {
        newWeeks.push(addWeeks(todayStart, i));
      }

      setWeeks(newWeeks);

      // After rebuilding the weeks, scroll to the middle (today's week)
      requestAnimationFrame(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
          let topOffset = 0;

          // Calculate heights up to today's week (index 12 in the new array)
          const weekElements = Array.from(scrollContainer.children);
          for (let i = 0; i < 12 && i < weekElements.length; i++) {
            const element = weekElements[i] as HTMLElement;
            topOffset += element.offsetHeight;
          }

          // Scroll to today's week
          scrollContainer.scrollTop = topOffset;

          // Update header and enable more loads
          requestAnimationFrame(() => {
            updateVisibleMonthHeader();
            setIsLoadingWeeks(false);
          });
        } else {
          setIsLoadingWeeks(false);
        }
      });
    }
  }, [today, weeks, isLoadingWeeks, updateVisibleMonthHeader]);

  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      // Initial header update
      updateVisibleMonthHeader();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll, updateVisibleMonthHeader]);

  // Initial scroll to center today's week
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && lastScrollTopRef.current === 0) {
      // Find today's week index (should be at index 12)
      const todayIndex = 12;

      // Wait for initial render
      requestAnimationFrame(() => {
        let topOffset = 0;
        const weekElements = Array.from(scrollContainer.children);

        for (let i = 0; i < todayIndex && i < weekElements.length; i++) {
          const element = weekElements[i] as HTMLElement;
          topOffset += element.offsetHeight;
        }

        // Set scroll position
        scrollContainer.scrollTop = topOffset;
        lastScrollTopRef.current = scrollContainer.scrollTop;

        // Update header
        updateVisibleMonthHeader();
      });
    }
  }, [updateVisibleMonthHeader]);

  return (
    <PageContainer>
      <CalendarHeader>
        <HeaderLeft>
          {/* <MonthNavigationButtons> */}
          {/* <NavButton onClick={navigateUpMonth} aria-label="Previous month">
              <IoChevronUp />
            </NavButton>
            <NavButton onClick={navigateDownMonth} aria-label="Next month">
              <IoChevronDown />
            </NavButton> */}
          {/* </MonthNavigationButtons> */}
          <h1>{format(currentVisibleDate, "MMMM yyyy")}</h1>
          <TodayButton onClick={scrollToToday}>Today</TodayButton>
        </HeaderLeft>
      </CalendarHeader>

      <WeekDaysHeader>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <WeekDayCell key={i}>{day}</WeekDayCell>
        ))}
      </WeekDaysHeader>

      <CalendarContainer ref={scrollContainerRef}>
        {weeks.map((weekStart) => {
          const weekKey = format(weekStart, "yyyy-MM-dd");
          return (
            <WeekRow
              key={weekKey}
              startDate={weekStart}
              onHeightChange={(height) =>
                handleWeekHeightChange(weekKey, height)
              }
            />
          );
        })}
        {isLoadingWeeks && (
          <LoadingIndicator>
            <div>Loading more weeks...</div>
          </LoadingIndicator>
        )}
      </CalendarContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px); /* Adjust based on your header height */
  width: 100%;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding: 0 ${({ theme }) => theme.spacing.sm};

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.fonts.heading || "inherit"};
    font-weight: bold;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.7;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

// const MonthNavigationButtons = styled.div`
//   display: flex;
//   flex-direction: row;
//   gap: 4px;
// `;

// const NavButton = styled.button`
//   background-color: transparent;
//   color: ${({ theme }) => theme.colors.text};
//   border: 1px solid ${({ theme }) => theme.colors.border};
//   border-radius: 4px;
//   width: 28px;
//   height: 28px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 1rem;
//   cursor: pointer;
//   transition: all 0.2s;
//   padding: 0;

//   &:hover {
//     background-color: ${({ theme }) => theme.colors.border};
//   }

//   &:focus {
//     outline: none;
//     box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
//   }
// `;

const TodayButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.light};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    opacity: 0.9;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

const WeekDaysHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const WeekDayCell = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  font-weight: bold;
  font-size: 0.8rem;
  opacity: 0.7;
`;

const CalendarContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  width: 100%;
  height: calc(
    100vh - 150px
  ); /* Adjust based on header + calendar header height */
  padding: ${({ theme }) => theme.spacing.sm} 0;

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

const WeekContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: ${({ theme }) => theme.colors.surface};
`;

const DayCell = styled.div<{
  isCurrentMonth: boolean;
  isMonthStart?: boolean;
  isMonthEnd?: boolean;
  isFirstWeekOfMonth?: boolean;
  isLastWeekOfMonth?: boolean;
  isFirstDayOfMonth?: boolean;
  month: number;
}>`
  /* Variable height for future events - doubled from 120px to 240px */
  min-height: 240px;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface};
  position: relative;

  /* Reset all borders to ensure we only apply what we need */
  border: none;

  /* Default lighter borders between all cells */
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  /* No special borders between months */
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
`;

const MonthDayLabel = styled.span`
  font-size: 0.9rem; /* Increased from 0.7rem to match day numbers */
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
  margin-left: 5px;
  opacity: 0.7;
`;

const DayNumber = styled.div`
  font-weight: bold;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &.today {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  opacity: 0.7;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  div {
    padding: 8px 16px;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

export default CalendarPage;
