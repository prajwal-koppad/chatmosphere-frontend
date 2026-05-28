import { format, isToday, isYesterday } from "date-fns";

export function parseUTCDate(dateString) {
  if (!dateString) return new Date();
  
  // If dateString is string and doesn't end with Z or timezone offset
  if (
    typeof dateString === "string" && 
    !dateString.endsWith("Z") && 
    !/[+-]\d{2}:?\d{2}$/.test(dateString)
  ) {
    return new Date(dateString + "Z");
  }
  return new Date(dateString);
}

export function formatMessageDate(dateString) {
  const date = parseUTCDate(dateString);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, "dd MMM yyyy"); // e.g., "14 Jul 2025"
}

