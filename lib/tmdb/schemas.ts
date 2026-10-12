import { z } from "zod";

// Lenient schemas: TMDB omits fields frequently; we treat unknowns as optional.
// These validate only what our adapters actually consume.

const genreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const productionCompanySchema = z.object({
  id: z.number(),
  name: z.string(),
});

const networkSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const createdBySchema = z.object({
  id: z.number(),
  name: z.string(),
});

// ---- Search / list results ----

const mediaResultSchema = z.object({
  id: z.number(),

  // /search/multi and /trending can provide this field,
  // but movie/tv list endpoints may omit it.
  media_type: z.string().optional(),

  title: z.string().nullish(),
  name: z.string().nullish(),
  original_title: z.string().nullish(),
  original_name: z.string().nullish(),

  overview: z.string().default(""),

  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),

  release_date: z.string().nullable().optional(),
  first_air_date: z.string().nullable().optional(),

  vote_average: z.number().default(0),
  vote_count: z.number().default(0),
  popularity: z.number().default(0),

  genre_ids: z.array(z.number()).nullish(),

  profile_path: z.string().nullable().optional(),
  known_for_department: z.string().nullable().optional(),
});

export const paginatedMediaSchema = z.object({
  page: z.number(),
  total_pages: z.number(),
  total_results: z.number(),
  results: z.array(mediaResultSchema),
});

// ---- Movie details ----

export const movieDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().nullish(),
  overview: z.string().default(""),
  tagline: z.string().nullable().optional(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullable(),
  runtime: z.number().nullable(),
  vote_average: z.number().default(0),
  vote_count: z.number().default(0),
  popularity: z.number().default(0),
  genres: z.array(genreSchema).default([]),
  status: z.string().nullish(),
});

// ---- TV details ----

export const tvDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string().nullish(),
  overview: z.string().default(""),
  tagline: z.string().nullable().optional(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  first_air_date: z.string().nullable(),
  last_air_date: z.string().nullable().optional(),
  vote_average: z.number().default(0),
  vote_count: z.number().default(0),
  popularity: z.number().default(0),
  genres: z.array(genreSchema).default([]),
  status: z.string().nullable(),
  number_of_seasons: z.number().nullable(),
  number_of_episodes: z.number().nullable(),
  networks: z.array(networkSchema).default([]),
  created_by: z.array(createdBySchema).default([]),
});

// ---- Credits ----

const castSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable(),
  character: z.string().default(""),
  order: z.number().default(0),
});

const crewSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable(),
  job: z.string().default(""),
  department: z.string().default(""),
});

export const creditsSchema = z.object({
  id: z.number(),
  cast: z.array(castSchema),
  crew: z.array(crewSchema),
});

// ---- Videos ----

// TMDB video objects occasionally omit or null out descriptive fields
// (name/site/type are not guaranteed). key and site are load-bearing:
// key must be a non-empty string, site must be a string for site filtering.
export const videoResultSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string().nullish().default(""),
  site: z.string().nullish().default(""),
  type: z.string().nullish().default(""),
  official: z.boolean().nullish().default(false),
  published_at: z.string().nullable().optional(),
});

export const videosSchema = z.object({
  id: z.number(),
  results: z.array(videoResultSchema),
});

// ---- Season ----

const episodeInSeasonSchema = z.object({
  id: z.number(),
  episode_number: z.number(),
  name: z.string(),
  overview: z.string().default(""),
  still_path: z.string().nullable(),
  air_date: z.string().nullable(),
  runtime: z.number().nullable().optional(),
  vote_average: z.number().default(0),
  season_number: z.number().optional(),
});

export const seasonSchema = z.object({
  id: z.number(),
  season_number: z.number(),
  name: z.string(),
  overview: z.string().default(""),
  poster_path: z.string().nullable(),
  air_date: z.string().nullable(),
  episodes: z.array(episodeInSeasonSchema),
});

// ---- Episode ----

const guestStarSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable(),
  character: z.string().default(""),
});

export const episodeSchema = z.object({
  id: z.number(),
  season_number: z.number(),
  episode_number: z.number(),
  name: z.string(),
  overview: z.string().default(""),
  still_path: z.string().nullable(),
  air_date: z.string().nullable(),
  runtime: z.number().nullable().optional(),
  vote_average: z.number().default(0),
  vote_count: z.number().default(0),
  crew: z.array(crewSchema).optional(),
  guest_stars: z.array(guestStarSchema).optional(),
});

// ---- Person ----

export const personSchema = z.object({
  id: z.number(),
  name: z.string(),
  biography: z.string().default(""),
  profile_path: z.string().nullable(),
  known_for_department: z.string().nullable(),
  birthday: z.string().nullable().optional(),
  deathday: z.string().nullable().optional(),
  place_of_birth: z.string().nullable().optional(),
  also_known_as: z.array(z.string()).optional(),
  imdb_id: z.string().nullable().optional(),
  homepage: z.string().nullable().optional(),
});

const combinedCastCreditSchema = z.object({
  id: z.number(),
  media_type: z.string().optional(),
  title: z.string().nullish(),
  name: z.string().nullish(),
  original_title: z.string().nullish(),
  original_name: z.string().nullish(),
  overview: z.string().default(""),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullable().optional(),
  first_air_date: z.string().nullable().optional(),
  vote_average: z.number().default(0),
  vote_count: z.number().default(0),
  popularity: z.number().default(0),
  genre_ids: z.array(z.number()).nullish(),
  character: z.string().nullish().default(""),
  order: z.number().nullish().default(0),
});

const combinedCrewCreditSchema = z.object({
  id: z.number(),
  media_type: z.string().optional(),
  title: z.string().nullish(),
  name: z.string().nullish(),
  original_title: z.string().nullish(),
  original_name: z.string().nullish(),
  overview: z.string().default(""),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullable().optional(),
  first_air_date: z.string().nullable().optional(),
  vote_average: z.number().default(0),
  vote_count: z.number().default(0),
  popularity: z.number().default(0),
  genre_ids: z.array(z.number()).nullish(),
  job: z.string().nullish().default(""),
  department: z.string().nullish().default(""),
});

export const personCombinedCreditsSchema = z.object({
  id: z.number(),
  cast: z.array(combinedCastCreditSchema).default([]),
  crew: z.array(combinedCrewCreditSchema).default([]),
});

// ---- Genres ----

export const genreListSchema = z.object({
  genres: z.array(genreSchema),
});

// ---- Watch Providers ----

const watchProviderSchema = z.object({
  provider_id: z.number(),
  provider_name: z.string(),
  logo_path: z.string().nullable(),
});

export const watchProvidersSchema = z.object({
  id: z.number(),
  results: z
    .object({
      US: z
        .object({
          flatrate: z.array(watchProviderSchema).optional(),
          rent: z.array(watchProviderSchema).optional(),
          buy: z.array(watchProviderSchema).optional(),
        })
        .optional(),
    })
    .optional(),
});

// ---- Keywords ----

const keywordSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const keywordsSchema = z.object({
  id: z.number(),
  keywords: z.array(keywordSchema).optional(),
  results: z.array(keywordSchema).optional(),
});

// ---- Recommendations / Similar ----

export const recommendationsSchema = paginatedMediaSchema;