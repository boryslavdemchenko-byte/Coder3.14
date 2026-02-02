// Simple date formatting helpers
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', weekday: 'short' }).toUpperCase();
}

export function isToday(dateStr) {
  const d = parseDate(dateStr);
  const today = new Date();
  return d.getDate() === today.getDate() && 
         d.getMonth() === today.getMonth() && 
         d.getFullYear() === today.getFullYear();
}

export function getDaysInMonth(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getMonthGrid(year, month) {
  const days = getDaysInMonth(year, month);
  const firstDay = days[0].getDay(); // 0 = Sun
  const grid = [];
  
  // Padding
  for (let i = 0; i < firstDay; i++) {
    grid.push(null);
  }
  
  return [...grid, ...days];
}
