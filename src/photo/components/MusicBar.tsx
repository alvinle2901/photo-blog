"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiSpotify } from "react-icons/si";
import useSWR from "swr";

type Track = {
	id: string;
	name: string;
	artistNames: string;
	albumName: string;
	albumArtUrl: string | null;
	spotifyUrl: string | null;
	youtubeVideoId: string;
};

type TracksResponse = {
	playlistId?: string;
	playlistName?: string | null;
	tracks: Track[];
};

const fetcher = async (url: string): Promise<TracksResponse> => {
	const res = await fetch(url);
	if (!res.ok) throw new Error("Unable to load music.");
	return res.json();
};

const workerHealthUrl = process.env.NEXT_PUBLIC_MUSIC_WORKER_HEALTH_URL;

function trackShuffleKey(track: Track) {
	let hash = 0;
	for (const character of track.id) {
		hash = (hash * 31 + character.charCodeAt(0)) | 0;
	}
	return hash;
}

export default function MusicBar() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const loadedVideoIdRef = useRef<string | null>(null);
	const hasAutoplayed = useRef(false);
	const tracksLengthRef = useRef(0);

	const { data } = useSWR<TracksResponse>("/api/music/tracks", fetcher, {
		revalidateOnFocus: false,
		shouldRetryOnError: false,
	});

	const tracks = useMemo(() => {
		return [...(data?.tracks ?? [])].sort(
			(left, right) => trackShuffleKey(left) - trackShuffleKey(right),
		);
	}, [data?.tracks]);
	const activeTrackIndex = tracks.length > 0 ? activeIndex % tracks.length : 0;
	const track = tracks[activeTrackIndex];

	useEffect(() => {
		tracksLengthRef.current = tracks.length;
	}, [tracks.length]);

	useEffect(() => {
		if (!workerHealthUrl) return;

		let retryTimer: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;

		const warmWorker = async (shouldRetry: boolean) => {
			try {
				const response = await fetch(workerHealthUrl, { cache: "no-store" });
				if (!response.ok) throw new Error("Music worker health check failed.");
			} catch {
				if (shouldRetry && !cancelled) {
					retryTimer = setTimeout(() => void warmWorker(false), 3_000);
				}
			}
		};

		void warmWorker(true);

		return () => {
			cancelled = true;
			if (retryTimer) clearTimeout(retryTimer);
		};
	}, []);

	// Initialise audio element once
	useEffect(() => {
		const audio = new Audio();
		audio.volume = 0.7;
		audio.addEventListener("playing", () => setIsPlaying(true));
		audio.addEventListener("pause", () => setIsPlaying(false));
		audio.addEventListener("ended", () => {
			if (tracksLengthRef.current > 0) {
				setActiveIndex((index) => (index + 1) % tracksLengthRef.current);
			}
		});
		audio.addEventListener("error", () => {
			setError("Playback error — skipping track.");
			if (tracksLengthRef.current > 0) {
				setActiveIndex((index) => (index + 1) % tracksLengthRef.current);
			}
		});
		audioRef.current = audio;
		return () => {
			audio.pause();
			audio.src = "";
		};
	}, []);

	const resolveAndPlay = useCallback(async (videoId: string) => {
		setError(null);
		setIsLoading(true);
		try {
			const res = await fetch(`/api/music/stream/${videoId}`);
			if (!res.ok) throw new Error(`Stream resolve failed: ${res.status}`);
			const { url } = (await res.json()) as {
				url: string;
			};

			const audio = audioRef.current;
			if (!audio) return;

			audio.pause();
			audio.src = url;
			loadedVideoIdRef.current = videoId;
			await audio.play();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Unable to start playback.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const togglePlayback = useCallback(async () => {
		if (!track) return;
		const audio = audioRef.current;
		if (!audio) return;

		setError(null);
		// Already loaded this track — just toggle
		if (loadedVideoIdRef.current === track.youtubeVideoId) {
			if (audio.paused) {
				await audio.play().catch((e) => setError(e.message));
			} else {
				audio.pause();
			}
			return;
		}
		await resolveAndPlay(track.youtubeVideoId);
	}, [track, resolveAndPlay]);

	const changeTrack = useCallback(
		async (newIndex: number) => {
			setActiveIndex(newIndex);
			if (!isPlaying) return;
			const newTrack = tracks[newIndex];
			if (newTrack) await resolveAndPlay(newTrack.youtubeVideoId);
		},
		[isPlaying, tracks, resolveAndPlay],
	);

	// Auto-advance when activeIndex changes while playing
	useEffect(() => {
		if (!isPlaying || !track) return;
		if (loadedVideoIdRef.current === track.youtubeVideoId) return;
		void resolveAndPlay(track.youtubeVideoId);
	}, [isPlaying, resolveAndPlay, track]);

	// Autoplay attempt on first load
	useEffect(() => {
		if (!track || hasAutoplayed.current) return;
		hasAutoplayed.current = true;
		void resolveAndPlay(track.youtubeVideoId).catch(() => {
			hasAutoplayed.current = false;
		});
	}, [track, resolveAndPlay]);

	if (!track) return null;

	const label = data?.playlistName ?? "PLAYLIST";

	return (
		<section
			aria-label={`Now playing from ${label}`}
			className="fixed bottom-4 left-4 z-30 flex w-[min(21rem,calc(100vw-7rem))] items-center gap-2 border border-[#dcd5cc] bg-[#fffdf9]/95 p-2 shadow-sm backdrop-blur md:bottom-6 md:left-auto md:right-6"
		>
			{/* Album art + play/pause overlay */}
			<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[4px]">
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
				<button
					type="button"
					aria-label={isPlaying ? "Pause" : "Play"}
					onClick={togglePlayback}
					disabled={isLoading}
					className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity disabled:cursor-wait ${isPlaying ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
				>
					{isLoading ? (
						<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
					) : isPlaying ? (
						<Pause className="h-4 w-4 text-white" fill="currentColor" />
					) : (
						<Play className="h-4 w-4 text-white" fill="currentColor" />
					)}
				</button>
			</div>

			{/* Track info */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1 text-[10px] tracking-[0.12em] text-[#7a746b] [font-family:'DM_Mono',monospace]">
					<SiSpotify aria-hidden="true" className="h-3 w-3 text-[#1db954]" />
					<span>{label.toUpperCase()}</span>
					<span className="ml-auto">
						{activeTrackIndex + 1}/{tracks.length}
					</span>
				</div>
				{track.spotifyUrl ? (
					<a
						href={track.spotifyUrl}
						target="_blank"
						rel="noreferrer"
						className="mt-0.5 block truncate text-sm font-medium text-[#18170f] hover:underline"
					>
						{track.name}
					</a>
				) : (
					<p className="mt-0.5 truncate text-sm font-medium text-[#18170f]">
						{track.name}
					</p>
				)}
				<p className="truncate text-xs text-[#7a746b]">{track.artistNames}</p>
			</div>

			{/* Prev / Next */}
			<div className="flex shrink-0 items-center">
				<button
					type="button"
					aria-label="Previous track"
					onClick={() =>
						void changeTrack(
							(activeTrackIndex - 1 + tracks.length) % tracks.length,
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
						void changeTrack((activeTrackIndex + 1) % tracks.length)
					}
					className="inline-flex h-8 w-7 items-center justify-center text-[#7a746b] transition-colors hover:text-[#18170f]"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			<p className="sr-only" aria-live="polite">
				{error}
			</p>
		</section>
	);
}
