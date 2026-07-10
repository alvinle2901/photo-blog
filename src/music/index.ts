export type MusicTrack = {
	albumArtUrl: string | null;
	albumName: string;
	artistNames: string;
	id: string;
	name: string;
	spotifyUrl: string;
};

export type TopTracksResponse = {
	tracks: MusicTrack[];
	sourceLabel?: string;
};
