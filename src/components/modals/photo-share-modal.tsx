"use client";

import Image from "next/image";
import { type ReactNode, useState, useSyncExternalStore } from "react";
import { BiCopy } from "react-icons/bi";
import { PiFacebookLogo } from "react-icons/pi";
import { TbPhotoShare, TbQrcode } from "react-icons/tb";
import { toast } from "sonner";

import { useAppState } from "@/state";
import { getOptimizedUrl } from "@/storage/utils";
import { cn } from "@/utils/cn";
import {
	createFacebookShareLink,
	getPathShare,
	shortenUrl,
} from "@/utils/string";

import { Dialog, DialogContent, DialogTitle } from "../ui/Dialog";

export default function PhotoShareModal() {
	const { photoShareData, setPhotoShareData } = useAppState();
	const [showQR, setShowQR] = useState(false);
	const canUseNativeShare = useSyncExternalStore(
		() => () => undefined,
		() => typeof navigator !== "undefined" && !!navigator.share,
		() => false,
	);

	const renderIcon = (
		icon: ReactNode,
		action: () => void,
		embedded?: boolean,
		label?: string,
	) => (
		<button
			type="button"
			aria-label={label}
			className={cn(
				"inline-flex h-10 items-center justify-center px-3.5",
				embedded ? "border-l" : "border rounded-md",
				"border-[#ddd5ca] bg-[#fbfaf7] text-[#3b352e] active:bg-[#efe8dd]",
				"cursor-pointer transition-colors hover:bg-[#f3eee7]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18170f]/25",
			)}
			onClick={action}
		>
			{icon}
		</button>
	);

	const handleClose = () => {
		setPhotoShareData?.(undefined);
		setShowQR(false);
	};

	if (!photoShareData) return null;

	const photo = photoShareData.photo;
	const pathShare = getPathShare(photo.id);
	const socialText = photo.title || photo.caption || "Photo";

	const isLandscape = photo.aspectRatio >= 1;
	const width = isLandscape ? 560 : 320;
	const height = Math.round(width / photo.aspectRatio);

	return (
		<Dialog
			open={Boolean(photoShareData)}
			onOpenChange={(open) => {
				if (!open) handleClose();
			}}
		>
			<DialogContent className="w-[94vw] max-w-[720px] rounded-lg border-[#d8d0c5] bg-[#f7f5f2] p-4 shadow-xl sm:p-5">
				<div className="space-y-3">
					<div className="flex items-center gap-2 pr-8 text-[#18170f]">
						<TbPhotoShare size={20} />
						<DialogTitle
							className="italic text-2xl font-normal leading-tight"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							share photo
						</DialogTitle>
					</div>

					{showQR ? (
						<div
							className={cn(
								"mx-auto flex h-[300px] w-[300px] items-center justify-center rounded-lg",
								"border border-[#ddd5ca] bg-white p-3 shadow-sm",
							)}
						>
							<Image
								src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pathShare)}`}
								alt="QR code"
								width={300}
								height={300}
								unoptimized
								className="h-full w-full rounded bg-white"
							/>
						</div>
					) : (
						<div className="flex justify-center overflow-hidden rounded-md bg-[#ebe7df]">
							<Image
								src={getOptimizedUrl(photo.url, "lg")}
								alt={photo.title || "Shared photo"}
								width={width}
								height={height}
								className="max-h-[62vh] w-auto object-contain"
								placeholder={photo.blurData ? "blur" : "empty"}
								blurDataURL={photo.blurData || undefined}
							/>
						</div>
					)}

					<div className="flex items-stretch gap-2">
						<div
							className={cn(
								"flex min-w-0 flex-1 items-center overflow-hidden rounded-md",
								"border border-[#ddd5ca] bg-[#fbfaf7] text-sm text-[#3b352e]",
							)}
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							<div className="min-w-0 flex-1 truncate px-3">
								{shortenUrl(pathShare)}
							</div>
							{renderIcon(
								<BiCopy size={18} />,
								() => {
									navigator.clipboard.writeText(pathShare);
									toast.success("Copied!");
								},
								true,
								"Copy share link",
							)}
						</div>

						{renderIcon(
							showQR ? <TbPhotoShare size={18} /> : <TbQrcode size={18} />,
							() => setShowQR((value) => !value),
							false,
							showQR ? "Show photo preview" : "Show QR code",
						)}
						{renderIcon(
							<PiFacebookLogo size={18} />,
							() => window.open(createFacebookShareLink(pathShare), "_blank"),
							false,
							"Share on Facebook",
						)}
						{canUseNativeShare &&
							renderIcon(
								<TbPhotoShare size={18} />,
								() => {
									navigator
										.share({
											title: socialText,
											text: photo.caption || undefined,
											url: pathShare,
										})
										.catch(() => undefined);
								},
								false,
								"Share",
							)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
