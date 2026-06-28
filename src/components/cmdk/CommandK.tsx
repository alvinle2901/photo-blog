import CommandKClient, { CommandKSection } from "./CommandKClient";
import {
	getUniqueCamerasCached,
	getUniqueFilmsCached,
	getUniqueYearsCached,
} from "@/photo/cache";

export default async function CommandK() {
	const [years, cameras, films] = await Promise.all([
		getUniqueYearsCached(),
		getUniqueCamerasCached(),
		getUniqueFilmsCached(),
	]);

	const serverSections: CommandKSection[] = [
		{
			heading: "years",
			items: years.map(({ year, count }) => ({
				label: year,
				annotation: count,
				annotationAria: `${count} photos`,
				path: `/year/${encodeURIComponent(year)}`,
			})),
		},
		{
			heading: "cameras",
			items: cameras.map(({ make, model, count }) => ({
				label: `${make} ${model}`,
				annotation: count,
				annotationAria: `${count} photos`,
				path: `/shot-on/${encodeURIComponent(make)}/${encodeURIComponent(model)}`,
			})),
		},
		{
			heading: "films",
			items: films.map(({ film, count }) => ({
				label: film,
				annotation: count,
				annotationAria: `${count} photos`,
				path: `/film/${encodeURIComponent(film)}`,
			})),
		},
	];

	return <CommandKClient serverSections={serverSections} footer="" />;
}
