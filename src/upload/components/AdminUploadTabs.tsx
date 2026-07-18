"use client";

import { Icons } from "@/components/icons";
import { TabContent, TabList, Tabs, TabTrigger } from "@/components/ui/Tabs";
import { Upload35mmForm } from "@/upload/components/Upload35mmForm";
import { UploadDropzone } from "@/upload/components/UploadDropzone";

const tabClass =
	"group flex min-h-[116px] flex-1 items-start gap-3 rounded-sm border border-[#d8d1c7] bg-[#f7f5f2] p-4 text-left transition data-[state=active]:border-[#18170f] data-[state=active]:bg-[#ebe7df] data-[state=active]:shadow-sm";

export function AdminUploadTabs() {
	return (
		<Tabs defaultValue="normal" className="space-y-5">
			<TabList className="grid gap-3 md:grid-cols-2">
				<TabTrigger value="normal" className={tabClass}>
					<span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[#d8d1c7] bg-[#ebe7df] text-[#6f675d] group-data-[state=active]:border-[#18170f] group-data-[state=active]:text-[#18170f]">
						<Icons.camera size={18} />
					</span>
					<span className="min-w-0">
						<span
							className="block text-2xl font-light italic leading-none text-[#18170f]"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							Normal picture
						</span>
						<span
							className="mt-2 block text-[10px] uppercase tracking-[0.16em] text-[#8c857a]"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							EXIF, palette, blur, variants
						</span>
					</span>
				</TabTrigger>
				<TabTrigger value="film" className={tabClass}>
					<span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[#d8d1c7] bg-[#ebe7df] text-[#6f675d] group-data-[state=active]:border-[#18170f] group-data-[state=active]:text-[#18170f]">
						<Icons.photos size={18} />
					</span>
					<span className="min-w-0">
						<span
							className="block text-2xl font-light italic leading-none text-[#18170f]"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							35mm scan
						</span>
						<span
							className="mt-2 block text-[10px] uppercase tracking-[0.16em] text-[#8c857a]"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							manual film metadata
						</span>
					</span>
				</TabTrigger>
			</TabList>

			<TabContent value="normal">
				<UploadDropzone />
			</TabContent>
			<TabContent value="film">
				<Upload35mmForm />
			</TabContent>
		</Tabs>
	);
}
