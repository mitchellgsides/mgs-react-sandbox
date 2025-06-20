import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  IconButton,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Today, Refresh } from "@mui/icons-material";
import styled from "styled-components";
import { format, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import DayDetailsMui from "./components/Day/DayDetailsMui";
import WeekRow from "./components/WeekRow";
import { useCalendarContext } from "./context/CalendarContext";

// Constants for performance optimization
export const MAX_WEEKS = 20; // Maximum number of weeks to keep in memory
export const WEEKS_TO_LOAD = 5; // Number of weeks to load at a time

const CalendarPageMui: React.FC = () => {
  const {
    visibleWeeks,
    setVisibleWeeks,
    currentWeek,
    today,
    loadMoreWeeks,
    selectedDate,
    setSelectedDate,
    isLoadingActivities,
    activitiesError,
    refreshActivities,
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
  }, [currentWeek, setVisibleWeeks]);

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
  }, [setSelectedDate, setVisibleWeeks]);

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
  }, [setVisibleWeeks]);

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
  }, [setVisibleWeeks]);

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
    <Container
      maxWidth="xl"
      sx={{ px: 1, height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Paper
        elevation={3}
        sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        {/* Calendar Header with MUI Components */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Month Navigation */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={navigatePrevMonth}
                aria-label="Previous month"
                color="primary"
              >
                <ChevronLeft />
              </IconButton>

              <Typography
                variant="h4"
                component="h1"
                sx={{ minWidth: 200, textAlign: "center" }}
              >
                {currentVisibleMonth}
              </Typography>

              <IconButton
                onClick={navigateNextMonth}
                aria-label="Next month"
                color="primary"
              >
                <ChevronRight />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              startIcon={<Today />}
              onClick={scrollToToday}
              sx={{ ml: 2 }}
            >
              This Week
            </Button>
          </Box>

          {/* Activity Status with MUI Components */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isLoadingActivities && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Loading activities...</Typography>
              </Box>
            )}

            {activitiesError && (
              <Alert
                severity="error"
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => refreshActivities()}
                  >
                    <Refresh fontSize="inherit" />
                  </IconButton>
                }
              >
                Error loading activities
              </Alert>
            )}

            {!isLoadingActivities && !activitiesError && (
              <Typography variant="body2" color="success.main">
                Activities loaded
              </Typography>
            )}
          </Box>
        </Box>

        {/* CalendarContent - PRESERVED AS REQUESTED */}
        <CalendarContent>
          {/* DayTitles - PRESERVED AS REQUESTED */}
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
                  />
                );
              })}
            </Calendar>
          </CalendarContainer>

          {selectedDate && <DayDetailsMui />}
        </CalendarContent>
      </Paper>
    </Container>
  );
};

// PRESERVED STYLED COMPONENTS - DayTitles and CalendarContent as requested
const CalendarContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
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

const CalendarContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none; /* Remove border-top since DayTitles has it */
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 300px;
  max-height: 50vh;
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

export default CalendarPageMui;
