"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SiSpotify } from "react-icons/si";
import useSWR from "swr";

import type { TopTracksResponse } from "@/music";

const fetcher = async (url: string): Promise<TopTracksResponse> => {
	const response = await fetch(url);

	if (response.status === 204) return { tracks: [] };
	if (!response.ok) throw new Error("Unable to load music.");

	return response.json();
};

export default function MusicBar() {
	const [activeTrackIndex, setActiveTrackIndex] = useState(0);
	const { data } = useSWR<TopTracksResponse>("/api/music/top-tracks", fetcher, {
		revalidateOnFocus: false,
		shouldRetryOnError: false,
	});
	const tracks = data?.tracks ?? [];
	const track = tracks[activeTrackIndex % tracks.length];

	if (!track) return null;

	return (
		<section
			aria-label="Top Spotify tracks from the last four weeks"
			className="fixed bottom-4 left-4 z-30 flex w-[min(21rem,calc(100vw-7rem))] items-center gap-2 border border-[#dcd5cc] bg-[#fffdf9]/95 p-2 shadow-sm backdrop-blur md:bottom-6 md:left-6"
		>
			<a
				href={track.spotifyUrl}
				target="_blank"
				rel="noreferrer"
				className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[4px]"
				aria-label={`Open ${track.name} on Spotify`}
			>
				{track.albumArtUrl ? (
					<Image
						src={track.albumArtUrl}
						alt={`${track.albumName} album cover`}
						fill
						sizes="44px"
						className="object-cover"
					/>
				) : (
					<span className="flex h-full w-full items-center justify-center bg-[#1ed760] text-[#18170f]">
						<SiSpotify aria-hidden="true" className="h-5 w-5" />
					</span>
				)}
			</a>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1 text-[10px] tracking-[0.12em] text-[#7a746b] [font-family:'DM_Mono',monospace]">
					<SiSpotify aria-hidden="true" className="h-3 w-3 text-[#1db954]" />
					<span>TOP 20 / 4 WEEKS</span>
					<span className="ml-auto">
						{(activeTrackIndex % tracks.length) + 1}/{tracks.length}
					</span>
				</div>
				<a
					href={track.spotifyUrl}
					target="_blank"
					rel="noreferrer"
					className="mt-0.5 block truncate text-sm font-medium text-[#18170f] hover:underline"
				>
					{track.name}
				</a>
				<p className="truncate text-xs text-[#7a746b]">{track.artistNames}</p>
			</div>
			<div className="flex shrink-0 items-center">
				<button
					type="button"
					aria-label="Previous track"
					onClick={() =>
						setActiveTrackIndex(
							(index) => (index - 1 + tracks.length) % tracks.length,
						)
					}
					className="inline-flex h-8 w-7 items-center justify-center text-[#7a746b] transition-colors hover:text-[#18170f]"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
				<button
					type="button"
					aria-label="Next track"
					onClick={() =>
						setActiveTrackIndex((index) => (index + 1) % tracks.length)
					}
					className="inline-flex h-8 w-7 items-center justify-center text-[#7a746b] transition-colors hover:text-[#18170f]"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</section>
	);
}
