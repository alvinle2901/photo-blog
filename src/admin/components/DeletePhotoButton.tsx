"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";

import { deleteFilmPhoto } from "@/35mm/actions";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { deletePhoto } from "@/photo/actions";
import { cn } from "@/utils/cn";

type DeletePhotoButtonProps = Omit<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	"type"
> & {
	id: string;
	type?: "digital" | "35mm";
	label?: string;
	className?: string;
	onDeleted?: (id: string) => void;
	redirectTo?: string;
	presentation?: "icon" | "menu-item";
};

export const DeletePhotoButton = React.forwardRef<
	HTMLButtonElement,
	DeletePhotoButtonProps
>(function DeletePhotoButton(
	{
		id,
		type = "digital",
		label,
		className,
		onClick,
		onDeleted,
		redirectTo,
		presentation = "icon",
		...props
	},
	ref,
) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);
	const resolvedLabel = label ?? (type === "35mm" ? "Delete scan" : "Delete");

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (
		event,
	) => {
		onClick?.(event);
		if (event.defaultPrevented) return;
		if (!confirm("Delete this photo? This cannot be undone.")) return;

		setIsDeleting(true);
		try {
			if (type === "35mm") {
				await deleteFilmPhoto(id);
			} else {
				await deletePhoto(id);
			}
			onDeleted?.(id);
			if (redirectTo) {
				router.replace(redirectTo);
				router.refresh();
			}
		} catch {
			alert("Could not delete this photo. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	if (presentation === "menu-item") {
		return (
			<button
				ref={ref}
				type="button"
				disabled={isDeleting}
				onClick={handleClick}
				className={cn(
					"flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-sm text-[#9a4d35] outline-none transition-colors hover:bg-[#fff0ea] hover:text-[#6f2f20] disabled:pointer-events-none disabled:opacity-45",
					className,
				)}
				{...props}
			>
				{isDeleting ? (
					<Icons.loader size={14} className="animate-spin" />
				) : (
					<Icons.trash size={14} />
				)}
				<span>{isDeleting ? "Deleting..." : resolvedLabel}</span>
			</button>
		);
	}

	return (
		<Button
			ref={ref}
			type="button"
			variant="outline"
			size="icon"
			disabled={isDeleting}
			onClick={handleClick}
			aria-label={props["aria-label"] ?? resolvedLabel}
			className={cn(
				"cursor-pointer size-8 rounded-full border-[#d9b8aa] bg-[#fff7f3] text-[#9a4d35] opacity-95 shadow-sm transition-all hover:bg-[#f7e6df] hover:text-[#6f2f20] group-hover:opacity-100 disabled:opacity-45",
				className,
			)}
			{...props}
		>
			{isDeleting ? (
				<Icons.loader size={15} className="animate-spin" />
			) : (
				<Icons.trash size={15} />
			)}
		</Button>
	);
});
