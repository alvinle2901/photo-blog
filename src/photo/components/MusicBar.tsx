"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiSpotify } from "react-icons/si";
import useSWR from "swr";

import type { TopTracksResponse } from "@/music";

const fetcher = async (url: string): Promise<TopTracksResponse> => {
	const response = await fetch(url);

	if (response.status === 204) return { tracks: [] };
	if (!response.ok) throw new Error("Unable to load music.");

	return response.json();
};

const getPlaybackToken = async () => {
	const response = await fetch("/api/music/playback-token", {
		cache: "no-store",
	});
	if (!response.ok)
		throw new Error("Spotify playback is only available to admin.");

	const data = (await response.json()) as { accessToken?: string };
	if (!data.accessToken) throw new Error("Unable to start Spotify playback.");

	return data.accessToken;
};

export default function MusicBar() {
	const [activeTrackIndex, setActiveTrackIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isSdkReady, setIsSdkReady] = useState(false);
	const [playbackError, setPlaybackError] = useState<string | null>(null);
	const playerRef = useRef<SpotifyPlayer | null>(null);
	const playerSetupRef = useRef<Promise<string> | null>(null);
	const { data } = useSWR<TopTracksResponse>("/api/music/top-tracks", fetcher, {
		revalidateOnFocus: false,
		shouldRetryOnError: false,
	});
	const tracks = data?.tracks ?? [];
	const track = tracks[activeTrackIndex % tracks.length];

	useEffect(
		() => () => {
			playerRef.current?.disconnect();
		},
		[],
	);

	const initializePlayer = useCallback(async () => {
		if (playerSetupRef.current) return playerSetupRef.current;
		if (!window.Spotify) throw new Error("Spotify playback is still loading.");

		const setup = new Promise<string>((resolve, reject) => {
			const player = new window.Spotify.Player({
				name: "momento",
				volume: 0.7,
				getOAuthToken: (callback) => {
					void getPlaybackToken()
						.then(callback)
						.catch(() => callback(""));
				},
			});

			player.addListener("ready", ({ device_id: deviceId }) => {
				playerRef.current = player;
				resolve(deviceId);
			});
			player.addListener("player_state_changed", (state) => {
				setIsPlaying(Boolean(state && !state.paused));
			});
			player.addListener("account_error", ({ message }) =>
				reject(new Error(message)),
			);
			player.addListener("authentication_error", ({ message }) =>
				reject(new Error(message)),
			);
			player.addListener("initialization_error", ({ message }) =>
				reject(new Error(message)),
			);

			void player.connect().then((connected) => {
				if (!connected) reject(new Error("Spotify player could not connect."));
			});
		});

		playerSetupRef.current = setup;
		try {
			return await setup;
		} catch (error) {
			playerSetupRef.current = null;
			throw error;
		}
	}, []);

	useEffect(() => {
		window.onSpotifyWebPlaybackSDKReady = () => {
			setIsSdkReady(true);
		};
		return () => {
			window.onSpotifyWebPlaybackSDKReady = undefined;
		};
	}, []);

	const togglePlayback = useCallback(async () => {
		if (!track) return;
		setPlaybackError(null);

		try {
			if (isPlaying && playerRef.current) {
				await playerRef.current.togglePlay();
				return;
			}

			const deviceId = await initializePlayer();
			await playerRef.current?.activateElement();
			const response = await fetch("/api/music/playback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ deviceId, trackId: track.id }),
			});

			if (!response.ok) throw new Error("Unable to start Spotify playback.");
		} catch (error) {
			setPlaybackError(
				error instanceof Error
					? error.message
					: "Unable to start Spotify playback.",
			);
		}
	}, [initializePlayer, isPlaying, track]);

	if (!track) return null;

	return (
		<>
			<Script
				src="https://sdk.scdn.co/spotify-player.js"
				strategy="afterInteractive"
				onError={() => setPlaybackError("Spotify playback could not load.")}
			/>
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
						aria-label={isPlaying ? "Pause track" : "Play track"}
						onClick={togglePlayback}
						disabled={!isSdkReady}
						className="inline-flex h-8 w-8 items-center justify-center border-r border-[#ded7ce] text-[#18170f] transition-colors hover:bg-[#f1ece5] disabled:cursor-wait disabled:text-[#aaa39a]"
					>
						{isPlaying ? (
							<Pause className="h-4 w-4" fill="currentColor" />
						) : (
							<Play className="h-4 w-4" fill="currentColor" />
						)}
					</button>
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
				<p className="sr-only" aria-live="polite">
					{playbackError}
				</p>
			</section>
		</>
	);
}
