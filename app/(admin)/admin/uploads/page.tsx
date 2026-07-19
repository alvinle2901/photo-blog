import { AdminUploadTabs } from "@/upload/components/AdminUploadTabs";

export default function AdminUploadsPage() {
	return (
		<div className="px-5 py-4 sm:px-8">
			<section className="mx-auto w-full max-w-[980px] space-y-6">
				<div>
					<h1
						className="mt-2 text-5xl font-light italic leading-none text-[#18170f]"
						style={{ fontFamily: "'Cormorant', serif" }}
					>
						upload
					</h1>
					{/* <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f675d]">
						Choose the right path before the file enters the archive: digital
						photos keep their camera metadata, while 35mm scans get a quieter
						manual pass.
					</p> */}
				</div>
				<AdminUploadTabs />
			</section>
		</div>
	);
}
