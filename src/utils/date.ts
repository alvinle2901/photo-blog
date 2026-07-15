export function formatDate(
	date: Date | string | null,
	includeTime = true,
): string {
	if (!date) return "";

	// Parse date if it's a string
	const d = typeof date === "string" ? new Date(date) : date;

	// Months mapping
	const months = [
		"JAN",
		"FEB",
		"MAR",
		"APR",
		"MAY",
		"JUN",
		"JUL",
		"AUG",
		"SEP",
		"OCT",
		"NOV",
		"DEC",
	];

	// Extract date components
	const day = String(d.getUTCDate()).padStart(2, "0");
	const month = months[d.getUTCMonth()];
	const year = d.getUTCFullYear();

	let formattedDate = `${day} ${month} ${year}`;

	if (includeTime) {
		let hours = d.getUTCHours();
		const minutes = String(d.getUTCMinutes()).padStart(2, "0");

		// Determine AM/PM and adjust hours
		const period = hours >= 12 ? "PM" : "AM";
		hours = hours % 12;
		hours = hours ? hours : 12; // Handle midnight

		formattedDate += ` ${hours}:${minutes}${period}`;
	}

	return formattedDate.toUpperCase();
}
