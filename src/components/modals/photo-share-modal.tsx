"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { BiCopy } from "react-icons/bi";
import { PiFacebookLogo } from "react-icons/pi";
import { TbPhotoShare, TbQrcode } from "react-icons/tb";
import { toast } from "sonner";

import { useNativeShare } from "@/hooks/use-native-share";
import { useAppState } from "@/providers/app-state";
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
	const canUseNativeShare = useNativeShare();

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
				"inline-flex size-9 items-center justify-center sm:h-10 sm:w-auto sm:px-3.5",
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
			<DialogContent className="box-border max-h-[90dvh] !w-[calc(100vw-2rem)] !max-w-[min(21.5rem,calc(100vw-2rem))] gap-0 overflow-x-hidden overflow-y-auto rounded-lg border-[#d8d0c5] bg-[#f7f5f2] p-3 shadow-xl sm:!w-[94vw] sm:!max-w-[720px] sm:p-5">
				<div className="min-w-0 space-y-2 sm:space-y-3">
					<div className="flex items-center gap-2 pr-8 text-[#18170f]">
						<TbPhotoShare size={20} />
						<DialogTitle
							className="italic text-xl font-normal leading-tight sm:text-2xl"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							share photo
						</DialogTitle>
					</div>

					{showQR ? (
						<div
							className={cn(
								"mx-auto flex aspect-square w-full max-w-[240px] items-center justify-center rounded-lg sm:max-w-[300px]",
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
								className="max-h-[48dvh] max-w-full object-contain sm:max-h-[62vh]"
								placeholder={photo.blurData ? "blur" : "empty"}
								blurDataURL={photo.blurData || undefined}
							/>
						</div>
					)}

					<div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-stretch gap-2">
						<div
							className={cn(
								"flex h-9 min-w-0 flex-1 items-center overflow-hidden rounded-md sm:h-10",
								"border border-[#ddd5ca] bg-[#fbfaf7] text-sm text-[#3b352e]",
							)}
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							<div
								className="min-w-0 flex-1 truncate px-3 text-xs sm:text-sm"
								title={pathShare}
							>
								{shortenUrl(pathShare, 44)}
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

						<div className="flex shrink-0 gap-2">
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
				</div>
			</DialogContent>
		</Dialog>
	);
}
