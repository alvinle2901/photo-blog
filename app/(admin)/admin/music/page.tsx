"use client";

import { useEffect, useRef, useState } from "react";

type SyncStatus =
	| { state: "idle" }
	| { state: "running" }
	| { state: "done"; matched: number; total: number }
	| { state: "failed"; message: string };

function parseSyncStatus(raw: string): SyncStatus {
	if (raw === "idle") return { state: "idle" };
	if (raw === "running") return { state: "running" };
	if (raw.startsWith("done:")) {
		const [m, t] = raw.slice(5).split("/").map(Number);
		return { state: "done", matched: m, total: t };
	}
	if (raw.startsWith("failed:"))
		return { state: "failed", message: raw.slice(7) };
	return { state: "idle" };
}

export default function MusicSettingsPage() {
	const [playlistInput, setPlaylistInput] = useState("");
	const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: "idle" });
	const [currentPlaylist, setCurrentPlaylist] = useState<{
		id: string;
		name: string;
		trackCount: number;
	} | null>(null);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Load current playlist info and sync status on mount
	useEffect(() => {
		void loadStatus();
	}, []);

	async function loadStatus() {
		const [tracksRes, statusRes] = await Promise.all([
			fetch("/api/music/tracks"),
			fetch("/api/music/sync"),
		]);
		if (tracksRes.ok) {
			const data = (await tracksRes.json()) as {
				playlistId?: string;
				playlistName?: string;
				tracks: unknown[];
			};
			if (data.playlistId) {
				setCurrentPlaylist({
					id: data.playlistId,
					name: data.playlistName ?? data.playlistId,
					trackCount: data.tracks.length,
				});
			}
		}
		if (statusRes.ok) {
			const { status } = (await statusRes.json()) as { status: string };
			setSyncStatus(parseSyncStatus(status ?? "idle"));
		}
	}

	function startPolling() {
		if (pollRef.current) return;
		pollRef.current = setInterval(async () => {
			const res = await fetch("/api/music/sync");
			if (!res.ok) return;
			const { status } = (await res.json()) as { status: string };
			const parsed = parseSyncStatus(status ?? "idle");
			setSyncStatus(parsed);
			if (parsed.state !== "running") {
				clearInterval(pollRef.current!);
				pollRef.current = null;
				if (parsed.state === "done") void loadStatus();
			}
		}, 2000);
	}

	async function handleSync(e: React.FormEvent) {
		e.preventDefault();
		const raw = playlistInput.trim();
		if (!raw) return;

		const idMatch = raw.match(/playlist\/([A-Za-z0-9]+)/);
		const playlistId = idMatch ? idMatch[1] : raw;

		setSyncStatus({ state: "running" });
		startPolling();

		const res = await fetch("/api/music/sync", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ playlistId }),
		});
		const data = (await res.json()) as {
			playlistName?: string;
			total?: number;
			matched?: number;
			failed?: number;
			error?: string;
		};

		if (!res.ok) {
			setSyncStatus({ state: "failed", message: data.error ?? "Sync failed" });
			clearInterval(pollRef.current!);
			pollRef.current = null;
		} else {
			setSyncStatus({
				state: "done",
				matched: data.matched ?? 0,
				total: data.total ?? 0,
			});
			clearInterval(pollRef.current!);
			pollRef.current = null;
			void loadStatus();
		}
	}

	return (
		<div className="max-w-xl space-y-6 p-6">
			<div>
				<h1 className="text-xl font-semibold">Music Bar</h1>
				<p className="mt-1 text-sm text-gray-500">
					Paste a Spotify playlist URL or ID. Tracks are matched to YouTube
					automatically — playback runs entirely on your server, no Spotify SDK.
				</p>
			</div>

			{/* Current playlist */}
			{currentPlaylist && (
				<div className="rounded-lg border bg-white p-4 text-sm">
					<p className="font-medium text-gray-700">Current playlist</p>
					<p className="mt-0.5 text-gray-500">
						<a
							href={`https://open.spotify.com/playlist/${currentPlaylist.id}`}
							target="_blank"
							rel="noreferrer"
							className="text-[#1db954] hover:underline font-mono"
						>
							{currentPlaylist.name}
						</a>{" "}
						— {currentPlaylist.trackCount} matched track
						{currentPlaylist.trackCount !== 1 ? "s" : ""}
					</p>
				</div>
			)}

			{/* Sync form */}
			<form
				onSubmit={handleSync}
				className="rounded-lg border bg-white p-5 space-y-4"
			>
				<div>
					<label
						htmlFor="playlistInput"
						className="block text-sm font-medium text-gray-700"
					>
						Spotify playlist URL or ID
					</label>
					<input
						id="playlistInput"
						value={playlistInput}
						onChange={(e) => setPlaylistInput(e.target.value)}
						placeholder="https://open.spotify.com/playlist/..."
						className="mt-2 w-full rounded border border-gray-200 px-3 py-2 text-sm font-mono focus:border-gray-400 focus:outline-none"
						disabled={syncStatus.state === "running"}
					/>
				</div>

				<button
					type="submit"
					disabled={syncStatus.state === "running" || !playlistInput.trim()}
					className="rounded bg-[#18170f] px-4 py-2 text-sm text-white hover:bg-[#2e2c1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{syncStatus.state === "running" ? "Syncing…" : "Sync playlist"}
				</button>

				{/* Status */}
				{syncStatus.state === "running" && (
					<p className="text-sm text-gray-500 flex items-center gap-2">
						<span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
						Fetching tracks from Spotify and matching on YouTube…
					</p>
				)}
				{syncStatus.state === "done" && (
					<p className="text-sm text-green-700">
						✓ Synced {syncStatus.matched}/{syncStatus.total} tracks
						{syncStatus.total - syncStatus.matched > 0
							? ` (${syncStatus.total - syncStatus.matched} unmatched)`
							: ""}
					</p>
				)}
				{syncStatus.state === "failed" && (
					<p className="text-sm text-red-600">✗ {syncStatus.message}</p>
				)}
			</form>

			<p className="text-xs text-gray-400">
				Matching uses YouTube Music search. Unmatched tracks are skipped in the
				player. Re-sync anytime to update.
			</p>
		</div>
	);
}
