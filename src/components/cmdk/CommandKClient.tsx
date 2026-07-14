"use client";

import { Command } from "cmdk";
import {
	Camera,
	Command as CommandIcon,
	CornerDownLeft,
	Grid3X3,
	ImageIcon,
	Map as MapIcon,
	Search,
	Shield,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { BiLockAlt, BiSolidUser } from "react-icons/bi";
import { HiDocumentText } from "react-icons/hi";

import { useAppState } from "@/providers/app-state";
import { cn } from "@/utils/cn";

import { Icons } from "../icons";
import { Dialog, DialogContent, DialogTitle } from "../ui/Dialog";
import CommandKItem from "./CommandKItem";

const LISTENER_KEYDOWN = "keydown";

type CommandKItemData = {
	label: string;
	keywords?: string[];
	accessory?: ReactNode;
	annotation?: ReactNode;
	annotationAria?: string;
	path?: string;
	action?: () => void | Promise<void>;
};

export type CommandKSection = {
	heading: string;
	accessory?: ReactNode;
	items: CommandKItemData[];
};

export default function CommandKClient({
	serverSections = [],
	footer,
}: {
	serverSections?: CommandKSection[];
	footer?: string;
}) {
	const pathname = usePathname();
	const {
		isUserLoggedIn,
		setIsUserLoggedIn,
		isCommandKOpen: isOpen,
		setIsCommandKOpen: setIsOpen,
	} = useAppState();

	const isOpenRef = useRef(isOpen);

	const [queryLiveRaw, setQueryLive] = useState("");

	const queryLive = useMemo(
		() => queryLiveRaw.trim().toLocaleLowerCase(),
		[queryLiveRaw],
	);

	const router = useRouter();

	useEffect(() => {
		isOpenRef.current = isOpen;
	}, [isOpen]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsOpen?.(!isOpenRef.current);
			}
		};
		document.addEventListener(LISTENER_KEYDOWN, down);
		return () => document.removeEventListener(LISTENER_KEYDOWN, down);
	}, [setIsOpen]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen?.(open);
		if (!open) setQueryLive("");
	};

	const baseItems: CommandKItemData[] = [
		{ label: "home", accessory: <Icons.home size={15} />, path: "/" },
		{ label: "grid", accessory: <Grid3X3 size={15} />, path: "/grid" },
		{ label: "35mm", accessory: <ImageIcon size={15} />, path: "/35mm" },
		{ label: "map", accessory: <MapIcon size={15} />, path: "/map" },
	];

	const pagesItems = baseItems.filter((item) => !(pathname === item.path));

	const sectionPages: CommandKSection = {
		heading: "pages",
		accessory: <HiDocumentText size={15} className="translate-x-[-1px]" />,
		items: pagesItems,
	};

	const sectionsWithAccessories = serverSections.map((section) => {
		if (section.accessory) return section;
		if (section.heading === "cameras") {
			return { ...section, accessory: <Camera size={15} /> };
		}
		if (section.heading === "films") {
			return { ...section, accessory: <ImageIcon size={15} /> };
		}
		return section;
	});

	const adminSection: CommandKSection = {
		heading: "admin",
		accessory: <BiSolidUser size={15} className="translate-x-[-1px]" />,
		items: isUserLoggedIn
			? (
					[
						{
							label: "dashboard",
							accessory: <Shield size={15} />,
							annotation: <BiLockAlt size={13} />,
							path: "/dashboard",
						},
						{
							label: "manage photos",
							accessory: <ImageIcon size={15} />,
							annotation: <BiLockAlt size={13} />,
							path: "/photos",
						},
					] as CommandKItemData[]
				).concat({
					label: "sign out",
					action: async () => {
						try {
							await fetch("/api/auth/sign-out", {
								method: "POST",
								credentials: "same-origin",
							});
						} finally {
							setIsUserLoggedIn?.(false);
							setIsOpen?.(false);
							router.push("/sign-in", { scroll: true });
							router.refresh();
						}
					},
				})
			: [
					{
						label: "sign in",
						accessory: <Shield size={15} />,
						path: "/sign-in",
					},
				],
	};

	const sections = [sectionPages]
		.concat(sectionsWithAccessories)
		.concat(adminSection)
		.filter(({ items }) => items.length > 0);

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				className={cn(
					"top-[45dvh] w-[90%] max-w-lg gap-0 overflow-hidden p-0 md:top-[40%]",
					"rounded-lg border-[#e5ddd2] bg-[#fbfaf7] shadow-2xl shadow-black/20",
					"data-[state=open]:slide-in-from-top-8 data-[state=closed]:slide-out-to-top-8",
					"[&>button]:right-3.5 [&>button]:top-3.5 [&>button]:text-[#8b8175]",
				)}
			>
				<Command
					label="Global Command Menu"
					filter={(value, searchValue, keywords) => {
						const searchFormatted = searchValue.trim().toLocaleLowerCase();
						return value.toLocaleLowerCase().includes(searchFormatted) ||
							keywords?.some((keyword) =>
								keyword.toLocaleLowerCase().includes(searchFormatted),
							)
							? 1
							: 0;
					}}
					loop
					className="overflow-hidden"
				>
					<div className="border-b border-[#ebe4da] bg-[#f8f5ef] px-4 pb-3 pt-3">
						<div className="mb-3 flex items-center justify-between pr-8">
							<DialogTitle
								className="flex items-center gap-2 text-base font-medium text-[#2b2824]"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								<span className="flex h-7 w-7 items-center justify-center rounded border border-[#e2d8cb] bg-[#fffdf9] text-[#81766b]">
									<CommandIcon size={15} />
								</span>
								command
							</DialogTitle>
							<div
								className="hidden items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-[#9d9489] sm:flex"
								aria-hidden="true"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								<span className="rounded border border-[#e2d8cb] bg-[#fffdf9] px-1.5 py-0.5">
									esc
								</span>
								<span>to close</span>
							</div>
						</div>
						<div className="relative">
							<Search
								size={17}
								className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a0988f]"
							/>
							<Command.Input
								value={queryLiveRaw}
								onValueChange={setQueryLive}
								className={cn(
									"h-12 w-full rounded-md border border-[#e2d8cb] bg-white py-2 pl-10 pr-3",
									"text-[15px] text-[#2b2824] outline-none transition-colors",
									"placeholder:text-[#aaa196]",
									"focus:border-[#cfc2b2] focus:ring-2 focus:ring-[#e6ddd1]/70",
								)}
								style={{ fontFamily: "'DM Mono', monospace" }}
								placeholder="Search pages, cameras, films, years ..."
							/>
						</div>
					</div>
					<Command.List
						className={cn(
							"max-h-56 overflow-y-auto px-2 py-2 sm:max-h-72",
							"scroll-py-2",
						)}
					>
						<Command.Empty className="px-3 py-8 text-center">
							<div
								className="text-sm text-[#6c655d]"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								No results found
							</div>
							<div className="mt-1 text-xs text-[#a0988f]">
								Try a camera, film, year, or page.
							</div>
						</Command.Empty>
						{sections.map(({ heading, accessory, items }) => (
							<Command.Group
								key={heading}
								heading={
									<div
										className="flex items-center gap-2 px-2 pb-1.5 pt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9d9489]"
										style={{ fontFamily: "'DM Mono', monospace" }}
									>
										{accessory && (
											<span className="flex h-5 w-5 items-center justify-center text-[#aaa196]">
												{accessory}
											</span>
										)}
										{heading}
									</div>
								}
								className="select-none first:[&>*:first-child]:pt-1"
							>
								{items.map(
									({
										label,
										keywords,
										accessory,
										annotation,
										annotationAria,
										path,
										action,
									}) => {
										const key = `${heading} ${label}`;
										return (
											<CommandKItem
												key={key}
												label={label}
												value={key}
												keywords={keywords}
												onSelect={() => {
													if (action) {
														action();
														if (!path) {
															handleOpenChange(false);
														}
													}
													if (path) {
														if (path !== pathname) {
															handleOpenChange(false);
															router.push(path, { scroll: true });
														} else {
															handleOpenChange(false);
														}
													}
												}}
												accessory={accessory}
												annotation={annotation}
												annotationAria={annotationAria}
											/>
										);
									},
								)}
							</Command.Group>
						))}
						{footer && !queryLive && (
							<div className="px-3 pb-2 pt-3 text-center text-xs text-[#a0988f]">
								{footer}
							</div>
						)}
					</Command.List>
					<div className="flex items-center justify-between border-t border-[#ebe4da] bg-[#f8f5ef] px-4 py-2.5 text-[11px] uppercase tracking-[0.08em] text-[#9d9489]">
						<div
							className="flex items-center gap-1.5"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							<CornerDownLeft size={13} />
							open
						</div>
						<div
							className="flex items-center gap-1.5"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							<span className="rounded border border-[#e2d8cb] bg-[#fffdf9] px-1.5 py-0.5">
								⌘
							</span>
							<span className="rounded border border-[#e2d8cb] bg-[#fffdf9] px-1.5 py-0.5">
								k
							</span>
						</div>
					</div>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
