import { DiaryEntry } from "./types";
import { getTodayDateString } from "./dateUtils";

export interface DailyActivityPoint {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Nov 21
  dayOfWeek: string; // Sat
  count: number;
  entries: DiaryEntry[];
  isToday: boolean;
}

export interface WeekDayActivity {
  dayName: string; // Mon, Tue...
  dateStr: string;
  count: number;
  isToday: boolean;
}

export interface MonthComparisonItem {
  monthKey: string; // YYYY-MM
  monthName: string; // November 2026
  shortMonth: string; // Nov 26
  totalEntries: number;
  totalImages: number;
  totalVideos: number;
  activeDaysCount: number;
  mostActiveDate: string | null;
  prevMonthDiff: number; // difference in entries vs previous month
  percentageChange: number; // percentage change vs previous month
}

export interface AnalyticsSummary {
  todayCount: number;
  thisWeekCount: number;
  lastWeekCount: number;
  weekChangePercentage: number;
  thisMonthCount: number;
  lastMonthCount: number;
  monthChangePercentage: number;
  totalEntriesCount: number;
  totalMediaCount: number;
  activeStreak: number;
  dailyPoints14Days: DailyActivityPoint[];
  dailyPoints30Days: DailyActivityPoint[];
  currentWeekDays: WeekDayActivity[];
  monthlyComparisons: MonthComparisonItem[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Calculates complete activity analytics and month-over-month comparisons from entries
 */
export function computeActivityAnalytics(entries: DiaryEntry[]): AnalyticsSummary {
  const todayStr = getTodayDateString();
  const today = new Date();

  // 1. Group entries by date
  const entriesByDate: Record<string, DiaryEntry[]> = {};
  let totalMedia = 0;

  for (const entry of entries) {
    if (!entry.entryDate) continue;
    if (!entriesByDate[entry.entryDate]) {
      entriesByDate[entry.entryDate] = [];
    }
    entriesByDate[entry.entryDate].push(entry);

    if (entry.media) {
      totalMedia += entry.media.length;
    }
  }

  // 2. Today's count
  const todayCount = (entriesByDate[todayStr] || []).length;

  // 3. This Week & Last Week Calculations (Monday-based or Sunday-based week)
  const currentDayOfWeek = today.getDay(); // 0 is Sunday
  const startOfThisWeek = new Date(today);
  // Set to start of week (Sunday)
  startOfThisWeek.setDate(today.getDate() - currentDayOfWeek);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  let thisWeekCount = 0;
  let lastWeekCount = 0;

  // Build 7-day breakdown for this week
  const currentWeekDays: WeekDayActivity[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfThisWeek);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayEntries = entriesByDate[dateStr] || [];
    const count = dayEntries.length;
    thisWeekCount += count;

    currentWeekDays.push({
      dayName: WEEKDAY_NAMES[d.getDay()],
      dateStr,
      count,
      isToday: dateStr === todayStr,
    });
  }

  // Calculate last week count
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfLastWeek);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const count = (entriesByDate[dateStr] || []).length;
    lastWeekCount += count;
  }

  const weekChangePercentage =
    lastWeekCount === 0
      ? thisWeekCount > 0 ? 100 : 0
      : Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);

  // 4. Daily Activity Points for Last 14 & 30 Days
  function buildDailyPoints(daysCount: number): DailyActivityPoint[] {
    const list: DailyActivityPoint[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayEntries = entriesByDate[dateStr] || [];
      const dayOfWeek = WEEKDAY_NAMES[d.getDay()];
      const dayLabel = `${dayOfWeek}, ${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;

      list.push({
        dateStr,
        dayLabel,
        dayOfWeek,
        count: dayEntries.length,
        entries: dayEntries,
        isToday: dateStr === todayStr,
      });
    }
    return list;
  }

  const dailyPoints14Days = buildDailyPoints(14);
  const dailyPoints30Days = buildDailyPoints(30);

  // 5. Month-by-Month Activity & Comparisons
  // Group entries by YYYY-MM
  const monthMap: Record<
    string,
    {
      year: number;
      month: number;
      entries: DiaryEntry[];
      dateCounts: Record<string, number>;
    }
  > = {};

  for (const entry of entries) {
    if (!entry.entryDate) continue;
    const parts = entry.entryDate.split("-");
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-based
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;

      if (!monthMap[key]) {
        monthMap[key] = { year, month, entries: [], dateCounts: {} };
      }
      monthMap[key].entries.push(entry);
      monthMap[key].dateCounts[entry.entryDate] =
        (monthMap[key].dateCounts[entry.entryDate] || 0) + 1;
    }
  }

  // Ensure current month and previous month exist in map even if empty
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  if (!monthMap[currentMonthKey]) {
    monthMap[currentMonthKey] = {
      year: today.getFullYear(),
      month: today.getMonth(),
      entries: [],
      dateCounts: {},
    };
  }

  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  if (!monthMap[prevMonthKey]) {
    monthMap[prevMonthKey] = {
      year: prevMonthDate.getFullYear(),
      month: prevMonthDate.getMonth(),
      entries: [],
      dateCounts: {},
    };
  }

  // Sort months chronologically
  const sortedMonthKeys = Object.keys(monthMap).sort();

  const monthlyComparisons: MonthComparisonItem[] = [];

  for (let idx = 0; idx < sortedMonthKeys.length; idx++) {
    const key = sortedMonthKeys[idx];
    const data = monthMap[key];
    const totalEntries = data.entries.length;

    let totalImages = 0;
    let totalVideos = 0;
    for (const e of data.entries) {
      if (e.media) {
        for (const m of e.media) {
          if (m.type === "image") totalImages++;
          if (m.type === "video") totalVideos++;
        }
      }
    }

    const activeDaysCount = Object.keys(data.dateCounts).length;

    // Find most active date
    let mostActiveDate: string | null = null;
    let maxCount = 0;
    for (const [date, count] of Object.entries(data.dateCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostActiveDate = date;
      }
    }

    // Comparison with previous month in sequence
    let prevMonthDiff = 0;
    let percentageChange = 0;

    if (idx > 0) {
      const prevKey = sortedMonthKeys[idx - 1];
      const prevCount = monthMap[prevKey].entries.length;
      prevMonthDiff = totalEntries - prevCount;
      percentageChange =
        prevCount === 0
          ? totalEntries > 0 ? 100 : 0
          : Math.round(((totalEntries - prevCount) / prevCount) * 100);
    }

    monthlyComparisons.push({
      monthKey: key,
      monthName: `${MONTH_NAMES[data.month]} ${data.year}`,
      shortMonth: `${SHORT_MONTHS[data.month]} '${String(data.year).slice(-2)}`,
      totalEntries,
      totalImages,
      totalVideos,
      activeDaysCount,
      mostActiveDate,
      prevMonthDiff,
      percentageChange,
    });
  }

  // Reverse monthlyComparisons for display (newest month first)
  const monthlyComparisonsNewestFirst = [...monthlyComparisons].reverse();

  const currentMonthItem = monthlyComparisons.find((m) => m.monthKey === currentMonthKey);
  const thisMonthCount = currentMonthItem?.totalEntries || 0;
  const monthChangePercentage = currentMonthItem?.percentageChange || 0;
  const lastMonthItem = monthlyComparisons.find((m) => m.monthKey === prevMonthKey);
  const lastMonthCount = lastMonthItem?.totalEntries || 0;

  // 6. Active Streak Calculation
  let activeStreak = 0;
  let checkDate = new Date(today);
  // Check if today has entry; if not, check if yesterday had entry to continue streak
  const hasEntryToday = (entriesByDate[todayStr] || []).length > 0;
  if (!hasEntryToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if ((entriesByDate[dStr] || []).length > 0) {
      activeStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    todayCount,
    thisWeekCount,
    lastWeekCount,
    weekChangePercentage,
    thisMonthCount,
    lastMonthCount,
    monthChangePercentage,
    totalEntriesCount: entries.length,
    totalMediaCount: totalMedia,
    activeStreak,
    dailyPoints14Days,
    dailyPoints30Days,
    currentWeekDays,
    monthlyComparisons: monthlyComparisonsNewestFirst,
  };
}
