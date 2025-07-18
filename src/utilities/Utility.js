import { format, isToday, isYesterday } from "date-fns";

export function formatMessageDate(dateString) {
  const date = new Date(dateString);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, "dd MMM yyyy"); // e.g., "14 Jul 2025"
}
