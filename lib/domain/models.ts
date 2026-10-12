// Normalized application domain models.
// These are intentionally decoupled from TMDB response shapes.

export type MediaType = "movie" | "tv";

export interface Genre {
  id: number;
  name: string;
}

export interface MediaSummary {
  id: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null; // movies: release_date, tv: first_air_date
  year: number | null;
  voteAverage: number;
  voteCount: number;
}

export interface Movie extends MediaSummary {
  mediaType: "movie";
  runtime: number | null;
  tagline: string | null;
  director: string | null;
  genres: Genre[];
}

export interface TVShow extends MediaSummary {
  mediaType: "tv";
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  status: string | null;
  tagline: string | null;
  networks: string[];
  creators: string[];
  genres: Genre[];
}

export interface Season {
  id: number;
  showId: number;
  seasonNumber: number;
  name: string;
  overview: string;
  posterPath: string | null;
  airDate: string | null;
  episodeCount: number;
}

export interface Episode {
  id: number;
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  stillPath: string | null;
  airDate: string | null;
  runtime: number | null;
  voteAverage: number;
  voteCount: number;
  guestStars: CastMember[];
  crew: CrewMember[];
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  profilePath: string | null;
  knownForDepartment: string | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  alsoKnownAs: string[];
  imdbId: string | null;
  homepage: string | null;
}

export interface PersonActingCredit extends MediaSummary {
  character: string;
  order: number;
}

export interface PersonCrewCredit extends MediaSummary {
  job: string;
  department: string;
}

export interface PersonFilmography {
  cast: PersonActingCredit[];
  crew: PersonCrewCredit[];
}

export interface Person {
  id: number;
  name: string;
  profilePath: string | null;
  knownForDepartment: string | null;
  knownFor: MediaSummary[];
}

export interface CastMember {
  id: number;
  name: string;
  profilePath: string | null;
  character: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  profilePath: string | null;
  job: string;
  department: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string; // YouTube, Vimeo
  type: string; // Trailer, Teaser, Clip, Featurette
  official: boolean;
  publishedAt: string | null;
}

export interface Paginated<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}
