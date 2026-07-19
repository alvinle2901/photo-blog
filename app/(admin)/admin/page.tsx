import { CityCountChart } from "@/admin/components/CityCountChart";
import GeoMap from "@/admin/components/GeoMap";
import ShuffleGrid from "@/admin/components/ShuffleGrid";
import { getPhotoDashboardSummary } from "@/photo/query";

export default async function AdminDashboard() {
	const summary = await getPhotoDashboardSummary();

	return (
		<div className="space-y-4 px-5 py-4 sm:px-8">
			<div>
				<h1
					className="mt-2 text-4xl font-light italic leading-none text-[#18170f]"
					style={{ fontFamily: "'Cormorant', serif" }}
				>
					dashboard
				</h1>
			</div>
			<div className="mx-auto grid h-full w-full grid-cols-1 items-stretch gap-5 overflow-x-hidden py-2 lg:grid-cols-12">
				<div className="flex lg:col-span-4">
					<CityCountChart
						cityCounts={summary.cityCounts}
						yearRange={summary.yearRange}
					/>
				</div>
				<div className="flex lg:col-span-8">
					<ShuffleGrid photos={summary.photos} />
				</div>
				<div className="h-[520px] overflow-hidden lg:col-span-12">
					<GeoMap countries={summary.countries} />
				</div>
			</div>
		</div>
	);
}
