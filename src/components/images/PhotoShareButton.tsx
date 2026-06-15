"use client";

import { TbPhotoShare } from "react-icons/tb";

export default function PhotoShareButton() {
	return (
		<button
			type="button"
			className="hover:text-gray-500 cursor-pointer"
			onClick={() => {
				// Intentionally left as a placeholder until share modal logic is added.
			}}
			aria-label="Share photo"
		>
			<TbPhotoShare size={18} />
		</button>
	);
}
