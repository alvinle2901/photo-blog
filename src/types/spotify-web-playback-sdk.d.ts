interface SpotifyPlayerState {
	paused: boolean;
}

interface SpotifyPlayer {
	activateElement: () => Promise<void>;
	connect: () => Promise<boolean>;
	disconnect: () => void;
	addListener: {
		(
			event: "ready",
			callback: (device: { device_id: string }) => void,
		): boolean;
		(
			event: "player_state_changed",
			callback: (state: SpotifyPlayerState | null) => void,
		): boolean;
		(
			event: "account_error" | "authentication_error" | "initialization_error",
			callback: (error: { message: string }) => void,
		): boolean;
	};
	togglePlay: () => Promise<void>;
}

interface SpotifyWebPlaybackSdk {
	Player: new (options: {
		getOAuthToken: (callback: (accessToken: string) => void) => void;
		name: string;
		volume?: number;
	}) => SpotifyPlayer;
}

interface Window {
	Spotify?: SpotifyWebPlaybackSdk;
	onSpotifyWebPlaybackSDKReady?: () => void;
}
