export function formatDate(dateString: string | null): string {
  if (!dateString) return '';

  // Parse ISO 8601 date string
  const date = new Date(dateString);

  // Months mapping
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  // Extract date components
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  // Determine AM/PM and adjust hours
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight

  // Format the date string
  const formattedDate = `${day} ${month} ${year} ${hours}:${minutes}${period}`;
  return formattedDate.toUpperCase();
}
