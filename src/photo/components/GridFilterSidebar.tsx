import Link from "next/link";

import { Icons } from "@/components/icons";
import { labelForFilm } from "@/film";

type FilmItem = { film: string; count: number };
type YearItem = { year: string; count: number };
type CameraItem = { make: string; model: string; count: number };

const sectionTitleClass =
	"text-[11px] uppercase tracking-[0.14em] text-[#8f877c] flex items-center gap-1.5";

const listClass = "mt-2 flex flex-wrap gap-1.5";
const itemClass =
	"rounded border border-[#ddd5ca] bg-[#f7f5f2] px-2 py-1 text-[11px] uppercase tracking-[0.06em] text-[#61594f] hover:bg-[#ece7df] hover:text-[#18170f] transition-colors";

export default function GridFilterSidebar({
	years,
	cameras,
	films,
}: {
	years: YearItem[];
	cameras: CameraItem[];
	films: FilmItem[];
}) {
	return (
		<>
			<section className="lg:hidden mb-4 rounded border border-[#e5e0d9] bg-[#f3efe8] p-3">
				<details open>
					<summary
						className="cursor-pointer list-none text-[11px] uppercase tracking-[0.14em] text-[#6f675d]"
						style={{ fontFamily: "'DM Mono', monospace" }}
					>
						Grid Filters
					</summary>

					<div className="mt-3 space-y-3">
						<div>
							<div
								className={sectionTitleClass}
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								<Icons.time size={12} />
								Year
							</div>
							<div className="mt-1.5 flex flex-wrap gap-1.5">
								{years.slice(0, 10).map((item) => (
									<Link
										key={item.year}
										href={`/year/${encodeURIComponent(item.year)}`}
										className="rounded border border-[#ddd5ca] bg-[#f7f5f2] px-2 py-1 text-[11px] uppercase tracking-[0.06em] text-[#61594f]"
									>
										{item.year}
									</Link>
								))}
							</div>
						</div>

						<div>
							<div
								className={sectionTitleClass}
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								<Icons.camera size={12} />
								Shot On
							</div>
							<div className="mt-1.5 flex flex-wrap gap-1.5">
								{cameras.slice(0, 8).map((item) => (
									<Link
										key={`${item.make}-${item.model}`}
										href={`/shot-on/${encodeURIComponent(item.make)}/${encodeURIComponent(item.model)}`}
										className="rounded border border-[#ddd5ca] bg-[#f7f5f2] px-2 py-1 text-[11px] uppercase tracking-[0.06em] text-[#61594f]"
									>
										{item.make} {item.model}
									</Link>
								))}
							</div>
						</div>

						<div>
							<div
								className={sectionTitleClass}
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								<Icons.photos size={12} />
								Film
							</div>
							<div className="mt-1.5 flex flex-wrap gap-1.5">
								{films.slice(0, 10).map((item) => (
									<Link
										key={item.film}
										href={`/film/${encodeURIComponent(item.film)}`}
										className="rounded border border-[#ddd5ca] bg-[#f7f5f2] px-2 py-1 text-[11px] uppercase tracking-[0.06em] text-[#61594f]"
									>
										{labelForFilm(item.film)}
									</Link>
								))}
							</div>
						</div>
					</div>
				</details>
			</section>

			<aside className="hidden lg:block w-[250px] shrink-0 pl-4">
				<div className="sticky top-6 space-y-5 pb-6">
					<section>
						<h3
							className={sectionTitleClass}
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							<Icons.time size={12} />
							Year
						</h3>
						<ul className={listClass}>
							{years.slice(0, 18).map((item) => (
								<li key={item.year}>
									<Link
										href={`/year/${encodeURIComponent(item.year)}`}
										className={itemClass}
										style={{ fontFamily: "'DM Mono', monospace" }}
									>
										<span>{item.year}</span>
									</Link>
								</li>
							))}
						</ul>
					</section>

					<section>
						<h3
							className={sectionTitleClass}
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							<Icons.camera size={12} />
							Shot On
						</h3>
						<ul className={listClass}>
							{cameras.slice(0, 18).map((item) => (
								<li key={`${item.make}-${item.model}`}>
									<Link
										href={`/shot-on/${encodeURIComponent(item.make)}/${encodeURIComponent(item.model)}`}
										className={itemClass}
										style={{ fontFamily: "'DM Mono', monospace" }}
									>
										<span className="truncate">
											{item.make} {item.model}
										</span>
									</Link>
								</li>
							))}
						</ul>
					</section>

					<section>
						<h3
							className={sectionTitleClass}
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							<Icons.photos size={12} />
							Film
						</h3>
						<ul className={listClass}>
							{films.slice(0, 18).map((item) => (
								<li key={item.film}>
									<Link
										href={`/film/${encodeURIComponent(item.film)}`}
										className={itemClass}
										style={{ fontFamily: "'DM Mono', monospace" }}
									>
										<span className="truncate">{labelForFilm(item.film)}</span>
									</Link>
								</li>
							))}
						</ul>
					</section>
				</div>
			</aside>
		</>
	);
}
