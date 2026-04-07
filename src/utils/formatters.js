import { format, parse } from 'date-fns';

/**
 * Formats a 24h time range string (e.g. "09:00-12:00") to 12h AM/PM (e.g. "09:00 AM - 12:00 PM")
 * @param {string} slot - The time slot string
 * @returns {string} - Formatted string
 */
export const formatTimeSlot = (slot) => {
  if (!slot || !slot.includes('-')) return slot;
  
  try {
    const [start, end] = slot.split('-');
    
    const formatTime = (t) => {
      const parsed = parse(t.trim(), 'HH:mm', new Date());
      return format(parsed, 'hh:mm a');
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  } catch (err) {
    console.warn('Failed to format time slot:', slot, err);
    return slot;
  }
};
