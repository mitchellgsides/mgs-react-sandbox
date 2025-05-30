import { useQuery } from '@tanstack/react-query';
import { fetchActivitiesForCalendar } from '../../supabase/supabase.activities';
import type { User } from '@supabase/supabase-js';

export const CALENDAR_ACTIVITIES_QUERY_KEY = 'calendar-activities';

export const useCalendarActivities = (user: User | null, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: [
      CALENDAR_ACTIVITIES_QUERY_KEY, 
      user?.id, 
      startDate.toISOString(), 
      endDate.toISOString()
    ],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      // Create an array of dates for the visible range
      const visibleWeeks: Date[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        visibleWeeks.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return fetchActivitiesForCalendar(user, visibleWeeks);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
