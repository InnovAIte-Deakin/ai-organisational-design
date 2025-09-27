/**
 * Utility functions for the chat app
 */

// Generate a new ID using crypto or fallback to Math.random
export const newId = () =>
  (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) +
  "-" +
  Date.now();

// Helper function to concatenate class names with proper handling
export const cx = (...list) => list.filter(Boolean).join(" ");

// Format date to a human-readable string
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Format date for message display
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Truncate text with ellipsis if it exceeds max length
export const truncate = (text, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};
