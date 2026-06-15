export function Flower() {
	return (
		<svg
			viewBox="0 0 110 200"
			width="160"
			height="300"
			fill="none"
			stroke="#b0a07a"
			strokeWidth="0.9"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{/* Stems */}
			<path d="M58,198 C56,168 58,128 62,60" />
			<path d="M58,198 C54,170 46,140 35,95" />
			<path d="M58,198 C63,174 74,152 82,128" />

			{/* Leaves */}
			<path d="M60,148 C52,138 46,130 44,122 C48,128 55,137 60,148" />
			<path d="M68,160 C76,150 82,142 83,134 C79,140 73,150 68,160" />

			{/* Flower 1 — large daisy, top */}
			<g transform="translate(62,60)">
				<ellipse cx="0" cy="-12" rx="3.5" ry="9" />
				<ellipse cx="0" cy="-12" rx="3.5" ry="9" transform="rotate(45)" />
				<ellipse cx="0" cy="-12" rx="3.5" ry="9" transform="rotate(90)" />
				<ellipse cx="0" cy="-12" rx="3.5" ry="9" transform="rotate(135)" />
				<ellipse cx="0" cy="-12" rx="3.5" ry="9" transform="rotate(180)" />
				<ellipse cx="0" cy="-12" rx="3.5" ry="9" transform="rotate(225)" />
				<ellipse cx="0" cy="-12" rx="3.5" ry="9" transform="rotate(270)" />
				<ellipse cx="0" cy="-12" rx="3.5" ry="9" transform="rotate(315)" />
				<circle cx="0" cy="0" r="5.5" fill="#c8b088" stroke="#b0a07a" />
			</g>

			{/* Flower 2 — medium, left */}
			<g transform="translate(35,95)">
				<ellipse cx="0" cy="-9" rx="3" ry="7" />
				<ellipse cx="0" cy="-9" rx="3" ry="7" transform="rotate(60)" />
				<ellipse cx="0" cy="-9" rx="3" ry="7" transform="rotate(120)" />
				<ellipse cx="0" cy="-9" rx="3" ry="7" transform="rotate(180)" />
				<ellipse cx="0" cy="-9" rx="3" ry="7" transform="rotate(240)" />
				<ellipse cx="0" cy="-9" rx="3" ry="7" transform="rotate(300)" />
				<circle cx="0" cy="0" r="4" fill="#c8b088" stroke="#b0a07a" />
			</g>

			{/* Flower 3 — small, right */}
			<g transform="translate(82,128)">
				<ellipse cx="0" cy="-7" rx="2.5" ry="5.5" />
				<ellipse cx="0" cy="-7" rx="2.5" ry="5.5" transform="rotate(60)" />
				<ellipse cx="0" cy="-7" rx="2.5" ry="5.5" transform="rotate(120)" />
				<ellipse cx="0" cy="-7" rx="2.5" ry="5.5" transform="rotate(180)" />
				<ellipse cx="0" cy="-7" rx="2.5" ry="5.5" transform="rotate(240)" />
				<ellipse cx="0" cy="-7" rx="2.5" ry="5.5" transform="rotate(300)" />
				<circle cx="0" cy="0" r="3" fill="#c8b088" stroke="#b0a07a" />
			</g>

			{/* Closed buds */}
			<path
				d="M52,122 C48,114 48,106 52,100 C53,107 54,114 52,122"
				strokeWidth="0.7"
			/>
			<path
				d="M70,92 C74,85 75,77 72,72 C70,77 69,85 70,92"
				strokeWidth="0.7"
			/>
		</svg>
	);
}
