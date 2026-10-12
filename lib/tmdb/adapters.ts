import type {
  CastMember,
  CrewMember,
  Episode,
  Genre,
  MediaSummary,
  Movie,
  Person,
  PersonActingCredit,
  PersonCrewCredit,
  PersonDetails,
  PersonFilmography,
  TVShow,
  Video,
} from "@/lib/domain/models";

import {
  creditsSchema,
  episodeSchema,
  genreListSchema,
  keywordsSchema,
  movieDetailsSchema,
  paginatedMediaSchema,
  personCombinedCreditsSchema,
  personSchema,
  tvDetailsSchema,
  videosSchema,
  watchProvidersSchema,
} from "./schemas";

export interface WatchProvider {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface WatchProviders {
  streaming: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
}

type MediaType = "movie" | "tv";

function yearFrom(date: string | null | undefined): number | null {
  if (!date) return null;

  const year = Number(date.slice(0, 4));

  return Number.isFinite(year) ? year : null;
}

function normalizeMediaResult(
  raw: {
    id: number;
    media_type?: string;
    title?: string | null;
    name?: string | null;
    overview?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string | null;
    first_air_date?: string | null;
    vote_average?: number;
    vote_count?: number;
  },
  fallbackMediaType?: MediaType,
): MediaSummary | null {
  const mediaType: MediaType | null =
    raw.media_type === "movie" || raw.media_type === "tv"
      ? raw.media_type
      : fallbackMediaType ?? null;

  // Ignore unsupported TMDB result types such as "person".
  if (!mediaType) {
    return null;
  }

  const title =
    mediaType === "movie"
      ? raw.title ?? raw.name ?? "Untitled"
      : raw.name ?? raw.title ?? "Untitled";

  const releaseDate =
    mediaType === "movie"
      ? raw.release_date ?? raw.first_air_date ?? null
      : raw.first_air_date ?? raw.release_date ?? null;

  return {
    id: raw.id,
    mediaType,
    title,
    overview: raw.overview ?? "",
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    releaseDate,
    year: yearFrom(releaseDate),
    voteAverage: raw.vote_average ?? 0,
    voteCount: raw.vote_count ?? 0,
  };
}

export function adaptPaginatedMedia(
  data: unknown,
  fallbackMediaType?: MediaType,
): {
  page: number;
  totalPages: number;
  totalResults: number;
  results: MediaSummary[];
} {
  const parsed = paginatedMediaSchema.parse(data);

  return {
    page: parsed.page,
    totalPages: parsed.total_pages,
    totalResults: parsed.total_results,

    results: parsed.results
      .map((item) => normalizeMediaResult(item, fallbackMediaType))
      .filter((result): result is MediaSummary => result !== null),
  };
}

export function adaptMovieDetails(data: unknown): Movie {
  const movie = movieDetailsSchema.parse(data);

  return {
    id: movie.id,
    mediaType: "movie",
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date,
    year: yearFrom(movie.release_date),
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
    runtime: movie.runtime,
    tagline: movie.tagline ?? null,
    director: null,
    genres: movie.genres,
  };
}

export function adaptTVDetails(data: unknown): TVShow {
  const tv = tvDetailsSchema.parse(data);

  return {
    id: tv.id,
    mediaType: "tv",
    title: tv.name,
    overview: tv.overview,
    posterPath: tv.poster_path,
    backdropPath: tv.backdrop_path,
    releaseDate: tv.first_air_date,
    year: yearFrom(tv.first_air_date),
    voteAverage: tv.vote_average,
    voteCount: tv.vote_count,
    numberOfSeasons: tv.number_of_seasons,
    numberOfEpisodes: tv.number_of_episodes,
    status: tv.status,
    tagline: tv.tagline ?? null,
    networks: tv.networks.map((network) => network.name),
    creators: tv.created_by.map((creator) => creator.name),
    genres: tv.genres,
  };
}

export function adaptCredits(data: unknown): {
  cast: CastMember[];
  crew: CrewMember[];
  director: string | null;
} {
  const credits = creditsSchema.parse(data);

  const cast: CastMember[] = credits.cast.map((member) => ({
    id: member.id,
    name: member.name,
    profilePath: member.profile_path,
    character: member.character,
    order: member.order,
  }));

  const crew: CrewMember[] = credits.crew.map((member) => ({
    id: member.id,
    name: member.name,
    profilePath: member.profile_path,
    job: member.job,
    department: member.department,
  }));

  const director =
    crew.find((member) => member.job === "Director")?.name ?? null;

  return {
    cast,
    crew,
    director,
  };
}

export function adaptVideos(data: unknown): Video[] {
  const videos = videosSchema.parse(data);

  return videos.results.map((video) => ({
    id: video.id,
    key: video.key,
    // Zod's .default() covers undefined but not explicit null — normalize here.
    name: video.name ?? "",
    site: video.site ?? "",
    type: video.type ?? "",
    official: video.official ?? false,
    publishedAt: video.published_at ?? null,
  }));
}

export function adaptPerson(data: unknown): Person {
  const person = personSchema.parse(data);

  return {
    id: person.id,
    name: person.name,
    profilePath: person.profile_path,
    knownForDepartment: person.known_for_department,
    knownFor: [],
  };
}

export function adaptPersonDetails(data: unknown): PersonDetails {
  const person = personSchema.parse(data);

  return {
    id: person.id,
    name: person.name,
    biography: person.biography ?? "",
    profilePath: person.profile_path,
    knownForDepartment: person.known_for_department,
    birthday: person.birthday ?? null,
    deathday: person.deathday ?? null,
    placeOfBirth: person.place_of_birth ?? null,
    alsoKnownAs: person.also_known_as ?? [],
    imdbId: person.imdb_id ?? null,
    homepage: person.homepage ?? null,
  };
}

export function adaptEpisodeDetails(data: unknown, showId: number): Episode {
  const parsed = episodeSchema.parse(data);

  return {
    id: parsed.id,
    showId,
    seasonNumber: parsed.season_number,
    episodeNumber: parsed.episode_number,
    name: parsed.name,
    overview: parsed.overview ?? "",
    stillPath: parsed.still_path,
    airDate: parsed.air_date,
    runtime: parsed.runtime ?? null,
    voteAverage: parsed.vote_average ?? 0,
    voteCount: parsed.vote_count ?? 0,
    guestStars:
      parsed.guest_stars?.map((g) => ({
        id: g.id,
        name: g.name,
        profilePath: g.profile_path,
        character: g.character ?? "",
        order: 0,
      })) ?? [],
    crew:
      parsed.crew?.map((c) => ({
        id: c.id,
        name: c.name,
        profilePath: c.profile_path,
        job: c.job ?? "",
        department: c.department ?? "",
      })) ?? [],
  };
}

function toMediaSummaryForCredit(raw: {
  id: number;
  media_type?: string;
  title?: string | null;
  name?: string | null;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  vote_average?: number;
  vote_count?: number;
}): MediaSummary | null {
  const mediaType =
    raw.media_type === "movie" || raw.media_type === "tv" ? raw.media_type : null;
  if (!mediaType) return null;
  // Reuse the shared media-shape normalization; credits carry the same fields.
  const normalized = normalizeMediaResult(raw, mediaType);
  return normalized;
}

export function adaptPersonCombinedCredits(data: unknown): PersonFilmography {
  const parsed = personCombinedCreditsSchema.parse(data);

  const castMap = new Map<string, PersonActingCredit>();
  for (const c of parsed.cast) {
    const base = toMediaSummaryForCredit(c);
    if (!base) continue;
    const key = `${base.mediaType}:${base.id}:${c.character ?? ""}`;
    if (castMap.has(key)) continue;
    castMap.set(key, {
      ...base,
      character: c.character ?? "",
      order: c.order ?? 0,
    });
  }

  const crewMap = new Map<string, PersonCrewCredit>();
  for (const c of parsed.crew) {
    const base = toMediaSummaryForCredit(c);
    if (!base) continue;
    const key = `${base.mediaType}:${base.id}:${c.job ?? ""}:${c.department ?? ""}`;
    if (crewMap.has(key)) continue;
    crewMap.set(key, {
      ...base,
      job: c.job ?? "",
      department: c.department ?? "",
    });
  }

  const byDateDesc = (a: MediaSummary, b: MediaSummary) =>
    (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "");
  const cast = [...castMap.values()].sort((a, b) => a.order - b.order || byDateDesc(a, b));
  const crew = [...crewMap.values()].sort(byDateDesc);

  return { cast, crew };
}

export function adaptGenres(data: unknown): Genre[] {
  return genreListSchema.parse(data).genres;
}

export function adaptRecommendations(data: unknown): MediaSummary[] {
  return adaptPaginatedMedia(data).results;
}

export function adaptWatchProviders(data: unknown): WatchProviders {
  const parsed = watchProvidersSchema.parse(data);
  const us = parsed.results?.US;
  const map = (arr: { provider_id: number; provider_name: string; logo_path: string | null }[] | undefined) =>
    (arr ?? []).map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path }));
  return {
    streaming: map(us?.flatrate),
    rent: map(us?.rent),
    buy: map(us?.buy),
  };
}

export function adaptKeywords(data: unknown): string[] {
  const parsed = keywordsSchema.parse(data);
  const keywords = parsed.keywords ?? parsed.results ?? [];
  return keywords.map((k) => k.name).slice(0, 12);
}
