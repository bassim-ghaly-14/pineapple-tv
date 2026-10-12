import { tmdbFetch } from "./client";

import {
  adaptCredits,
  adaptEpisodeDetails,
  adaptGenres,
  adaptKeywords,
  adaptMovieDetails,
  adaptPaginatedMedia,
  adaptPerson,
  adaptPersonCombinedCredits,
  adaptPersonDetails,
  adaptRecommendations,
  adaptTVDetails,
  adaptVideos,
  adaptWatchProviders,
} from "./adapters";
import { seasonSchema } from "./schemas";
import { buildDiscoverParams, type DiscoverFilters } from "@/lib/discover/filters";

const DEFAULT_LANG = "en-US";

// ============================================================
// Trending
// ============================================================

export async function getTrending(
  mediaType: "all" | "movie" | "tv" | "person",
  timeWindow: "day" | "week",
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch(`/trending/${mediaType}/${timeWindow}`, {
      params: { language },
      revalidate: 1800,
    }),
  );
}

// ============================================================
// Movies
// ============================================================

export async function getPopularMovies(
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/movie/popular", {
      params: {
        page,
        language,
      },
      revalidate: 3600,
    }),
    "movie",
  );
}

export async function getTopRatedMovies(
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/movie/top_rated", {
      params: {
        page,
        language,
      },
      revalidate: 7200,
    }),
    "movie",
  );
}

export async function getUpcomingMovies(
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/movie/upcoming", {
      params: {
        page,
        language,
      },
      revalidate: 3600,
    }),
    "movie",
  );
}

export async function getNowPlayingMovies(
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/movie/now_playing", {
      params: {
        page,
        language,
      },
      revalidate: 3600,
    }),
    "movie",
  );
}

// ============================================================
// Movie Details
// ============================================================

export async function getMovieDetails(
  id: number,
  language = DEFAULT_LANG,
) {
  const [movie, credits, videos, recommendations, similar, providers, keywords] =
    await Promise.all([
      tmdbFetch(`/movie/${id}`, { params: { language }, revalidate: 3600 }),
      tmdbFetch(`/movie/${id}/credits`, { params: { language }, revalidate: 86400 }),
      tmdbFetch(`/movie/${id}/videos`, { params: { language }, revalidate: 86400 }),
      tmdbFetch(`/movie/${id}/recommendations`, { params: { language, page: 1 }, revalidate: 86400 }),
      tmdbFetch(`/movie/${id}/similar`, { params: { language, page: 1 }, revalidate: 86400 }),
      tmdbFetch(`/movie/${id}/watch/providers`, { params: { language }, revalidate: 86400 }),
      tmdbFetch(`/movie/${id}/keywords`, { params: { language }, revalidate: 86400 }),
    ]);

  const adaptedMovie = adaptMovieDetails(movie);
  const { cast, crew, director } = adaptCredits(credits);

  return {
    movie: { ...adaptedMovie, director },
    cast,
    crew,
    videos: adaptVideos(videos),
    recommendations: adaptRecommendations(recommendations),
    similar: adaptRecommendations(similar),
    providers: adaptWatchProviders(providers),
    keywords: adaptKeywords(keywords),
  };
}

// ============================================================
// TV
// ============================================================

export async function getPopularTV(
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/tv/popular", {
      params: {
        page,
        language,
      },
      revalidate: 3600,
    }),
    "tv",
  );
}

export async function getTopRatedTV(
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/tv/top_rated", {
      params: {
        page,
        language,
      },
      revalidate: 7200,
    }),
    "tv",
  );
}

export async function getAiringTodayTV(
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/tv/airing_today", {
      params: {
        page,
        language,
      },
      revalidate: 3600,
    }),
    "tv",
  );
}

export async function getOnTheAirTV(
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/tv/on_the_air", {
      params: {
        page,
        language,
      },
      revalidate: 3600,
    }),
    "tv",
  );
}

// ============================================================
// TV Details
// ============================================================

export async function getTVDetails(
  id: number,
  language = DEFAULT_LANG,
) {
  const [tv, credits, videos, recommendations, similar, providers, keywords] =
    await Promise.all([
      tmdbFetch(`/tv/${id}`, { params: { language }, revalidate: 3600 }),
      tmdbFetch(`/tv/${id}/credits`, { params: { language }, revalidate: 86400 }),
      tmdbFetch(`/tv/${id}/videos`, { params: { language }, revalidate: 86400 }),
      tmdbFetch(`/tv/${id}/recommendations`, { params: { language, page: 1 }, revalidate: 86400 }),
      tmdbFetch(`/tv/${id}/similar`, { params: { language, page: 1 }, revalidate: 86400 }),
      tmdbFetch(`/tv/${id}/watch/providers`, { params: { language }, revalidate: 86400 }),
      tmdbFetch(`/tv/${id}/keywords`, { params: { language }, revalidate: 86400 }),
    ]);

  const { cast, crew } = adaptCredits(credits);

  return {
    tv: adaptTVDetails(tv),
    cast,
    crew,
    videos: adaptVideos(videos),
    recommendations: adaptRecommendations(recommendations),
    similar: adaptRecommendations(similar),
    providers: adaptWatchProviders(providers),
    keywords: adaptKeywords(keywords),
  };
}

// ============================================================
// TV Seasons
// ============================================================

export async function getSeasonDetails(
  seriesId: number,
  seasonNumber: number,
  language = DEFAULT_LANG,
) {
  const data = await tmdbFetch(`/tv/${seriesId}/season/${seasonNumber}`, {
    params: { language },
    revalidate: 86400,
  });
  const parsed = seasonSchema.parse(data);
  return {
    id: parsed.id,
    showId: seriesId,
    seasonNumber: parsed.season_number,
    name: parsed.name,
    overview: parsed.overview,
    posterPath: parsed.poster_path,
    airDate: parsed.air_date,
    episodeCount: parsed.episodes.length,
    episodes: parsed.episodes.map((ep) => ({
      id: ep.id,
      showId: seriesId,
      seasonNumber: parsed.season_number,
      episodeNumber: ep.episode_number,
      name: ep.name,
      overview: ep.overview,
      stillPath: ep.still_path,
      airDate: ep.air_date,
      runtime: ep.runtime ?? null,
      voteAverage: ep.vote_average,
      voteCount: 0,
      guestStars: [],
      crew: [],
    })),
  };
}

export async function getEpisodeDetails(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  language = DEFAULT_LANG,
) {
  return adaptEpisodeDetails(
    await tmdbFetch(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`, {
      params: { language },
      revalidate: 86400,
    }),
    seriesId,
  );
}

// ============================================================
// Discover
// ============================================================

export async function discoverMovies(filters: DiscoverFilters = {}, language = DEFAULT_LANG) {
  return adaptPaginatedMedia(
    await tmdbFetch("/discover/movie", {
      params: { ...buildDiscoverParams(filters), language, include_adult: false },
      revalidate: 600,
    }),
    "movie",
  );
}

export async function discoverTV(filters: DiscoverFilters = {}, language = DEFAULT_LANG) {
  return adaptPaginatedMedia(
    await tmdbFetch("/discover/tv", {
      params: { ...buildDiscoverParams(filters), language, include_adult: false },
      revalidate: 600,
    }),
    "tv",
  );
}

// ============================================================
// Search
// ============================================================

export async function searchMulti(
  query: string,
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/search/multi", {
      params: {
        query,
        page,
        language,
        include_adult: false,
      },
      revalidate: 600,
    }),
  );
}

export async function searchMovies(
  query: string,
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/search/movie", {
      params: {
        query,
        page,
        language,
        include_adult: false,
      },
      revalidate: 600,
    }),
    "movie",
  );
}

export async function searchTV(
  query: string,
  page = 1,
  language = DEFAULT_LANG,
) {
  return adaptPaginatedMedia(
    await tmdbFetch("/search/tv", {
      params: {
        query,
        page,
        language,
        include_adult: false,
      },
      revalidate: 600,
    }),
    "tv",
  );
}

// ============================================================
// Genres
// ============================================================

export async function getMovieGenres(
  language = DEFAULT_LANG,
) {
  return adaptGenres(
    await tmdbFetch("/genre/movie/list", {
      params: { language },
      revalidate: 86400,
    }),
  );
}

export async function getTVGenres(
  language = DEFAULT_LANG,
) {
  return adaptGenres(
    await tmdbFetch("/genre/tv/list", {
      params: { language },
      revalidate: 86400,
    }),
  );
}

// ============================================================
// Person
// ============================================================

export async function getPersonDetails(
  id: number,
  language = DEFAULT_LANG,
) {
  return adaptPerson(
    await tmdbFetch(`/person/${id}`, {
      params: { language },
      revalidate: 86400,
    }),
  );
}

export async function getPersonFullDetails(
  id: number,
  language = DEFAULT_LANG,
) {
  const [details, credits] = await Promise.all([
    tmdbFetch(`/person/${id}`, { params: { language }, revalidate: 86400 }),
    tmdbFetch(`/person/${id}/combined_credits`, { params: { language }, revalidate: 86400 }),
  ]);

  return {
    person: adaptPersonDetails(details),
    filmography: adaptPersonCombinedCredits(credits),
  };
}