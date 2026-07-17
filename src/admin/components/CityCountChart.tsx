"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/Chart";

type CityCountChartProps = {
	cityCounts: Array<{ city: string; count: number }>;
	yearRange: string | null;
};

const chartConfig = {
	count: {
		label: "Photos",
	},
} satisfies ChartConfig;

const COLORS = [
	"#18170f",
	"#6f675d",
	"#8c857a",
	"#b5b0a8",
	"#d8d1c7",
	"#9a7656",
	"#4d5c4f",
];

export function CityCountChart({ cityCounts, yearRange }: CityCountChartProps) {
	const chartData = cityCounts.slice(0, 7).map((entry, index) => ({
		...entry,
		fill: COLORS[index % COLORS.length],
	}));
	const totalPhotos = chartData.reduce((acc, curr) => acc + curr.count, 0);

	return (
		<Card className="flex h-full min-h-[450px] w-full flex-col overflow-hidden rounded-sm border-[#e5e0d9] bg-[#f7f5f2] shadow-sm">
			<CardHeader className="space-y-2 border-b border-[#e5e0d9]">
				<div className="flex items-start justify-between gap-4">
					<div>
						<CardTitle
							className="text-3xl font-light italic tracking-normal text-[#18170f]"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							City count
						</CardTitle>
						<CardDescription
							className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#8c857a]"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							{yearRange ?? "No dated photos yet"}
						</CardDescription>
					</div>
					<span
						className="rounded-full border border-[#d8d1c7] bg-[#ebe7df] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#6f675d]"
						style={{ fontFamily: "'DM Mono', monospace" }}
					>
						top {chartData.length}
					</span>
				</div>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col justify-between gap-4 p-5">
				{chartData.length === 0 ? (
					<div className="flex min-h-[300px] items-center justify-center rounded-sm bg-[#ebe7df] text-sm text-[#8c857a]">
						No city metadata yet.
					</div>
				) : (
					<>
						<ChartContainer
							config={chartConfig}
							className="mx-auto h-[290px] w-full max-w-[290px] aspect-auto"
						>
							<PieChart>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel nameKey="city" />}
								/>
								<Pie
									data={chartData}
									dataKey="count"
									nameKey="city"
									innerRadius={68}
									outerRadius={105}
									paddingAngle={2}
									strokeWidth={0}
								>
									{chartData.map((entry) => (
										<Cell key={entry.city} fill={entry.fill} />
									))}
									<Label
										content={({ viewBox }) => {
											if (viewBox && "cx" in viewBox && "cy" in viewBox) {
												return (
													<text
														x={viewBox.cx}
														y={viewBox.cy}
														textAnchor="middle"
														dominantBaseline="middle"
													>
														<tspan
															x={viewBox.cx}
															y={viewBox.cy}
															className="fill-[#18170f] text-3xl font-light"
														>
															{totalPhotos.toLocaleString()}
														</tspan>
														<tspan
															x={viewBox.cx}
															y={(viewBox.cy || 0) + 24}
															className="fill-[#8c857a] text-[11px] uppercase tracking-[0.12em]"
														>
															photos
														</tspan>
													</text>
												);
											}
										}}
									/>
								</Pie>
							</PieChart>
						</ChartContainer>
						<div className="grid gap-2">
							{chartData.slice(0, 5).map((entry) => (
								<div
									key={entry.city}
									className="flex items-center justify-between gap-3 text-sm"
								>
									<div className="flex min-w-0 items-center gap-2">
										<span
											className="h-2.5 w-2.5 shrink-0 rounded-full"
											style={{ backgroundColor: entry.fill }}
										/>
										<span className="truncate text-[#6f675d]">
											{entry.city}
										</span>
									</div>
									<span
										className="text-[11px] uppercase tracking-[0.12em] text-[#18170f]"
										style={{ fontFamily: "'DM Mono', monospace" }}
									>
										{entry.count}
									</span>
								</div>
							))}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
