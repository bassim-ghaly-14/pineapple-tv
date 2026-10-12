// Centralized, predictable TanStack Query keys.

export const qk = {
  trending: (mediaType: "all" | "movie" | "tv" | "person", window: "day" | "week") =>
    ["tmdb", "trending", mediaType, window] as const,

  popularMovies: () => ["tmdb", "movies", "popular"] as const,
  topRatedMovies: () => ["tmdb", "movies", "top-rated"] as const,
  upcomingMovies: () => ["tmdb", "movies", "upcoming"] as const,
  nowPlayingMovies: () => ["tmdb", "movies", "now-playing"] as const,

  popularTV: () => ["tmdb", "tv", "popular"] as const,
  topRatedTV: () => ["tmdb", "tv", "top-rated"] as const,
  airingTodayTV: () => ["tmdb", "tv", "airing-today"] as const,
  onTheAirTV: () => ["tmdb", "tv", "on-the-air"] as const,

  movieDetails: (id: number) => ["tmdb", "movie", id] as const,
  tvDetails: (id: number) => ["tmdb", "tv", id] as const,
  seasonDetails: (id: number, seasonNumber: number) =>
    ["tmdb", "tv", id, "season", seasonNumber] as const,
  episodeDetails: (id: number, seasonNumber: number, episodeNumber: number) =>
    ["tmdb", "tv", id, "season", seasonNumber, "episode", episodeNumber] as const,

  search: (type: "multi" | "movie" | "tv", query: string, page: number) =>
    ["tmdb", "search", type, query, page] as const,

  genres: (type: "movie" | "tv") => ["tmdb", "genres", type] as const,
  person: (id: number) => ["tmdb", "person", id] as const,
  personDetails: (id: number) => ["tmdb", "person", id, "details"] as const,
};
